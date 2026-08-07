// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

// ----------------------------------------------------------------
// 🏠 真實物件資料同步：接收 n8n 抓好並解析過的健美家(Kenbiya)真實物件資料，
// 驗證後 upsert 進 Supabase properties 表。
//
// 原本 n8n 對 10 個來源網站列表頁做 regex 抓取，抓不到就假造 20 筆湊數。
// 改成鎖定健美家 —— 唯一同時符合「大阪」「收益物件」「靜態 HTML 即含真實
// 圖片與完整文案」且未被反爬蟲阻擋的來源（其餘 9 個來源已實測 403／404／
// 連線失敗，見 CLAUDE.md）。
//
// 實際抓取／解析 HTML 的工作放在 n8n 的 Code 節點執行，而不是這支 API：
// 實測發現 Cloudflare Workers 的對外 IP 會被健美家的 F5 WAF 反爬蟲擋下
// （回應直接失敗，htmlLength 為 0），但 n8n Cloud 的對外 IP 沒有被擋。
// 所以這支 API 只負責「驗證＋寫入 Supabase」，不對健美家發任何請求。
// ----------------------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function isValidRecord(r) {
  return (
    r &&
    typeof r.id === 'string' &&
    typeof r.title_zh === 'string' &&
    typeof r.price_jpy === 'number' &&
    r.price_jpy > 0 &&
    Array.isArray(r.images) &&
    r.images.length > 0
  );
}

// 抓回來的地址欄位常常夾帶版面殘留物——健美家詳情頁的地址後面接著一個
// 「地図」連結，regex 抓下來會變成
//   "大阪府大阪市中央区南船場1-3-21\r\n      \r\n        \r\n        地図"
// 直接顯示在物件卡上很難看。另外日式漢字（区／ノ）也在這裡一併正規化成
// 台灣讀者習慣的寫法，讓資料庫裡存的就已經是可直接顯示的內容。
function cleanLocation(loc) {
  if (typeof loc !== 'string') return loc;
  return loc
    .split(/[\r\n]/)[0] // 地址本體只在第一行，後面都是版面殘留
    .replace(/地図/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/区/g, '區')
    .replace(/ノ/g, '之');
}

function normalizeRecord(r) {
  return r.location ? { ...r, location: cleanLocation(r.location) } : r;
}

async function upsertProperties(records) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const res = await fetch(`${url}/rest/v1/properties`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(records)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert 失敗 (${res.status}): ${text}`);
  }
}

function isAuthorized(request) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: '請求格式錯誤，需要 JSON body' }, 400);
  }

  const incoming = Array.isArray(body?.records) ? body.records : null;
  if (!incoming) {
    return json({ error: '缺少 records 陣列' }, 400);
  }

  const valid = incoming.filter(isValidRecord).map(normalizeRecord);
  const invalid = incoming.length - valid.length;

  try {
    if (valid.length > 0) {
      await upsertProperties(valid);
    }
    return json({ ok: true, received: incoming.length, upserted: valid.length, skipped: invalid });
  } catch (err) {
    console.error('❌ 物件同步失敗:', err);
    return json({ error: String(err) }, 500);
  }
}
