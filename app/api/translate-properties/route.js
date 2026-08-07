// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

// ----------------------------------------------------------------
// 🈯 物件日文內容 → 繁體中文翻譯
//
// 來源（健美家）的標題與物件說明都是日文原文，對台灣買家可讀性很差。
// 這支 API 會挑出「還沒翻譯過」的物件，逐筆送去翻譯後寫回 Supabase。
//
// **為什麼獨立成一支 API，不直接塞進 sync-properties？**
// Cloudflare Workers 單次請求有 subrequest 上限（免費方案 50 個），
// 而翻譯是「每筆物件 2 個欄位 = 2 個外部請求」。跟抓取流程綁在一起會
// 很容易撞上限，也會讓 n8n 那邊本來就吃緊的 60 秒逾時更危險。
// 拆開之後每次只處理 BATCH_SIZE 筆，n8n 每天呼叫，幾天內就會全部翻完，
// 之後新進來的物件也會被逐步補上。
//
// 翻譯後保留日文原文（description_ja / title_ja），一來可查證翻譯有沒有
// 失真，二來萬一之後想改用更好的翻譯服務可以重跑。
//
// 標題與說明走兩條不同的路線，理由寫在 lib/jpGlossary.js：
// 標題查表（數字絕對不能被機器翻譯動到），說明才用機器翻譯。
// ----------------------------------------------------------------

import { jpToZh, hasKana } from '@/lib/jpGlossary';

const BATCH_SIZE = 15;
const TRANSLATED_MARK = '［繁中翻譯］';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function isAuthorized(request) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`;
}

// 我們自己加的來源前綴，翻譯時要先拿掉、翻完再補回去——
// 不然「健美家」會被 Google 音譯成「Kenbi-ya」之類的東西。
const SOURCE_PREFIX = '【健美家】';

// 注意：不要用「有沒有假名」來判斷需不需要翻譯。健美家有大量標題是純漢字
// （例如「松屋駅 徒歩4分 SRC造 S60築」），一個假名都沒有但確實是日文，
// 用假名偵測會整批漏掉。因為這支 API 本來就只處理 KENBIYA-* 的資料列
// （來源保證是日文），直接無條件翻譯即可，靠 TRANSLATED_MARK 保證不重翻。

async function translate(text) {
  if (!text) return text;
  // Google 這個 endpoint 單次有長度限制，太長要切段送
  const CHUNK = 1200;
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK) chunks.push(text.slice(i, i + CHUNK));

  const out = [];
  for (const chunk of chunks) {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=zh-TW&dt=t&q=' +
      encodeURIComponent(chunk);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!res.ok) throw new Error(`翻譯失敗 ${res.status}`);
    const data = await res.json();
    // 回傳格式是 [[[譯文, 原文, ...], [譯文, 原文, ...], ...], ...]
    out.push((data[0] || []).map((seg) => (seg && seg[0]) || '').join(''));
  }
  return out.join('');
}

function supabaseHeaders() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json'
  };
}

export async function POST(request) {
  if (!isAuthorized(request)) return json({ error: 'Unauthorized' }, 401);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return json({ error: '缺少 NEXT_PUBLIC_SUPABASE_URL' }, 500);

  try {
    // 只抓健美家來源的物件（旗艦物件的文案是我們自己寫的中文，不需要翻）
    const listRes = await fetch(
      `${base}/rest/v1/properties?select=id,title_zh,description_zh&id=like.KENBIYA-*&limit=200`,
      { headers: supabaseHeaders() }
    );
    if (!listRes.ok) throw new Error(`讀取 properties 失敗 ${listRes.status}`);
    const rows = await listRes.json();

    const untranslated = rows.filter((r) => !(r.description_zh || '').startsWith(TRANSLATED_MARK));
    const pending = untranslated.slice(0, BATCH_SIZE);

    let done = 0;
    const failed = [];

    for (const row of pending) {
      try {
        // 標題先剝掉「【健美家】」前綴再翻，翻完補回去
        const rawTitle = (row.title_zh || '').startsWith(SOURCE_PREFIX)
          ? row.title_zh.slice(SOURCE_PREFIX.length)
          : row.title_zh;

        // 標題查表；只有查完仍有假名殘留（多半是大樓專名，例如「ラフォーレ」）
        // 才退回機器翻譯，翻完再過一次表把術語校回來。
        let title = jpToZh(rawTitle);
        if (hasKana(title)) title = jpToZh(await translate(rawTitle));

        // 說明是長篇文章，查表撐不住，用機器翻譯後再校正術語
        const desc = jpToZh(await translate(row.description_zh));

        const patchRes = await fetch(`${base}/rest/v1/properties?id=eq.${encodeURIComponent(row.id)}`, {
          method: 'PATCH',
          headers: { ...supabaseHeaders(), Prefer: 'return=minimal' },
          body: JSON.stringify({
            title_zh: SOURCE_PREFIX + (title || rawTitle),
            description_zh: TRANSLATED_MARK + (desc || '')
          })
        });
        if (!patchRes.ok) throw new Error(`寫回失敗 ${patchRes.status}`);
        done++;
      } catch (e) {
        failed.push({ id: row.id, error: String(e) });
      }
    }

    return json({ ok: true, translated: done, failed, remaining: untranslated.length - done });
  } catch (err) {
    console.error('❌ 翻譯流程失敗:', err);
    return json({ error: String(err) }, 500);
  }
}
