// ----------------------------------------------------------------
// 🏠 健美家大阪物件抓取（本機執行）
//
// **為什麼不放在 n8n 跑？**
// 2026-08-07 實測：n8n Cloud 的對外 IP 打健美家一律回 429（Too Many
// Requests），四個地區分頁全部失敗；同一份程式碼、同一批網址在使用者
// 本機跑則是 41 筆全部 HTTP 200。Cloudflare Workers 的 IP 更早之前就
// 已經被擋（見 CLAUDE.md）。也就是說「雲端跑抓取」這條路兩個平台都走
// 不通了，只剩本機 IP 可用。
//
// n8n 的試用方案也只剩十幾天，與其繼續繞，不如把抓取搬回本機——反正
// 寫入端 (/api/sync-properties) 早就做好了，這支腳本只要抓完 POST 過去。
//
// 用法：
//   node scripts/scrape-kenbiya.mjs            # 跑一輪（預設 6 個地區）
//   node scripts/scrape-kenbiya.mjs --all      # 跑完全部 54 個地區
//   node scripts/scrape-kenbiya.mjs --dry      # 只抓不寫入，看結果
//
// 需要環境變數 SYNC_SECRET（跟 Cloudflare 上設的那把一樣）。
// ----------------------------------------------------------------

const API = 'https://japan.her-yow.com/api/sync-properties';
const SUPA = 'https://nfegislkpuzqylwcfnoc.supabase.co';
const SUPA_KEY = 'sb_publishable_ceNh3H1XvVzubJW7uKv3Rw_pujGphDu';
const BASE = 'https://www.kenbiya.com';
const TARGET = 1000;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 對健美家保持禮貌：每批 4 個並行、批次間隔 1.2 秒、地區之間 1 秒。
// 之前用 35 個並行請求打過去整批 429，冷卻很久，不值得為了快幾分鐘冒這個險。
const BATCH = 4;
const BATCH_GAP = 1200;
const SEG_GAP = 1000;

const SEGMENTS = [
  'osaka-shi/1/', 'osaka-shi/2/', 'osaka-shi/3/', 'osaka-shi/4/', 'osaka-shi/5/',
  'osaka-shi/6/', 'osaka-shi/7/', 'osaka-shi/8/', 'osaka-shi/9/', 'osaka-shi/10/',
  'osaka-shi/11/', 'osaka-shi/12/', 'osaka-shi/13/', 'osaka-shi/14/', 'osaka-shi/15/',
  'osaka-shi/16/', 'osaka-shi/17/', 'osaka-shi/18/', 'osaka-shi/19/', 'osaka-shi/20/',
  'osaka-shi/21/', 'osaka-shi/22/', 'osaka-shi/23/', 'osaka-shi/24/', 'osaka-shi/',
  'sakai-shi/', 'sakai-shi/1/', 'sakai-shi/3/', 'sakai-shi/4/', 'sakai-shi/6/',
  'higashiosaka-shi/', 'toyonaka-shi/', 'suita-shi/', 'hirakata-shi/', 'takatsuki-shi/',
  'yao-shi/', 'ibaraki-shi/', 'neyagawa-shi/', 'moriguchi-shi/', 'kadoma-shi/',
  'matsubara-shi/', 'kishiwada-shi/', 'izumi-shi/', 'ikeda-shi/', 'daito-shi/',
  'settsu-shi/', 'izumisano-shi/', 'habikino-shi/', 'kaizuka-shi/', 'kashiwara-shi/',
  'kawachinagano-shi/', 'mino-shi/', 'takaishi-shi/', 'tondabayashi-shi/'
];

const TYPES = [
  '一棟売りマンション', '一棟マンション', '一棟売りアパート', '一棟アパート',
  '区分マンション', '戸建賃貸', 'ビル', '店舗', '事務所', 'テナント', '土地'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function text(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// 詳情頁欄位都是 <dt>標籤</dt><dd>值</dd>；同一頁下方還有一份「用語說明」
// 用同樣結構（值是「…を表示。」這種說明文），要濾掉才不會抓到說明文字。
function dd(html, label) {
  const re = new RegExp('<dt>[^<]*' + label + '[^<]*</dt>\\s*<dd[^>]*>([\\s\\S]{0,400}?)</dd>', 'g');
  for (const m of html.matchAll(re)) {
    const v = text(m[1]);
    if (v && !/表示。|を表示|表示$/.test(v)) return v;
  }
  return '';
}

// 價格拆在多層 span 裡（<span>6,580</span>万円），去標籤後數字與單位之間
// 會多出空白，一定要先全部清掉才對得上。
function parsePriceJPY(s) {
  if (!s) return 0;
  const t = s.replace(/[\s,]/g, '');
  const oku = (t.match(/([\d.]+)億/) || [])[1];
  const man = (t.match(/([\d.]+)万/) || [])[1];
  let v = 0;
  if (oku) v += parseFloat(oku) * 1e8;
  if (man) v += parseFloat(man) * 1e4;
  if (!v) {
    const yen = (t.match(/([\d.]+)円/) || [])[1];
    if (yen) v = parseFloat(yen);
  }
  return Math.round(v);
}

function parseDetail(h, url) {
  const id = 'KENBIYA-' + (url.match(/re_(\w+)/) || [])[1];
  const title = text((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  const price = parsePriceJPY(dd(h, '価格'));
  const roi = parseFloat((dd(h, '利回り').replace(/\s/g, '').match(/([\d.]+)\s*[%％]/) || [])[1] || 0);
  // 欄位標籤是「住所」不是「所在地」——「所在地」只出現在下方用語說明區
  const address = dd(h, '住所') || dd(h, '所在地');
  const access = dd(h, '交通');
  const type = TYPES.find((t) => title.includes(t)) || dd(h, '建物構造') || '収益物件';

  // 物件照片路徑固定是 /upload/p<群組>/<物件編號>/…；
  // /upload/column_list_image/ 之類的是站上文章縮圖，不要收進來
  const imgs = [...new Set(h.match(/\/upload\/p\d+\/\d+\/[^\s"']+\.(?:jpg|jpeg|png)/gi) || [])]
    .slice(0, 8)
    .map((p) => BASE + p);

  if (!id || !title || !price || !imgs.length) return null;

  const comment =
    dd(h, '備考') ||
    text((h.match(/buyer_comment[^>]*>([\s\S]{20,2500}?)<\/(?:div|section)>/) || [])[1]);
  const desc = [comment, access ? '交通：' + access : ''].filter(Boolean).join('\n');

  return {
    id,
    title_zh: '【健美家】' + title.slice(0, 160),
    price_jpy: price,
    price_twd: Math.round((price * 0.21) / 10000),
    location: address || '大阪府',
    roi: roi || 0,
    type,
    image_url: imgs[0],
    images: imgs,
    original_url: url,
    description_zh: (desc || title).slice(0, 1800),
    line_link: null
  };
}

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.text();
}

async function existingIds() {
  const r = await fetch(SUPA + '/rest/v1/properties?select=id', {
    headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY, Range: '0-1999' }
  });
  const arr = await r.json();
  return new Set(Array.isArray(arr) ? arr.map((x) => x.id) : []);
}

async function push(records) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) throw new Error('缺少環境變數 SYNC_SECRET');
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + secret },
    body: JSON.stringify({ records })
  });
  const body = await r.text();
  if (!r.ok) throw new Error('同步 API ' + r.status + ': ' + body.slice(0, 200));
  return body;
}

const argAll = process.argv.includes('--all');
const argDry = process.argv.includes('--dry');

const seen = await existingIds();
console.log('資料庫現有物件：' + seen.size + ' 筆');
if (seen.size >= TARGET) {
  console.log('已達 ' + TARGET + ' 筆目標，不需要再抓。');
  process.exit(0);
}

// 每輪從還沒抓滿的地區開始輪替；--all 就一次跑完全部
const segs = argAll ? SEGMENTS : SEGMENTS.slice(0, 6);
let scraped = 0;
let blocked = 0;

for (const seg of segs) {
  let paths = [];
  try {
    const html = await get(BASE + '/pp3/k/osaka/' + seg);
    paths = [...new Set(html.match(/\/pp3\/k\/osaka\/[a-z0-9\-]+\/(?:\d+\/)?re_\w+\//g) || [])];
  } catch (e) {
    console.log('  ✗ ' + seg + ' 列表頁失敗：' + e.message);
    if (String(e.message).includes('429')) blocked++;
    await sleep(SEG_GAP);
    continue;
  }

  const fresh = paths.filter((p) => !seen.has('KENBIYA-' + (p.match(/re_(\w+)/) || [])[1]));
  if (!fresh.length) {
    console.log('  – ' + seg + '：' + paths.length + ' 筆，全部已存在');
    await sleep(SEG_GAP);
    continue;
  }

  const records = [];
  for (let i = 0; i < fresh.length; i += BATCH) {
    const got = await Promise.all(
      fresh.slice(i, i + BATCH).map(async (p) => {
        try {
          return parseDetail(await get(BASE + p), BASE + p);
        } catch (e) {
          return null;
        }
      })
    );
    for (const r of got) if (r) records.push(r);
    await sleep(BATCH_GAP);
  }

  if (records.length && !argDry) {
    await push(records);
    for (const r of records) seen.add(r.id);
  }
  scraped += records.length;
  console.log(
    '  ✓ ' + seg + '：列表 ' + paths.length + ' / 新 ' + fresh.length + ' / 成功 ' + records.length +
    (argDry ? '（dry-run，未寫入）' : '') + ' → 累計 ' + seen.size
  );

  if (seen.size >= TARGET) {
    console.log('已達 ' + TARGET + ' 筆目標，提前結束。');
    break;
  }
  await sleep(SEG_GAP);
}

console.log('\n本輪新增 ' + scraped + ' 筆，資料庫共 ' + seen.size + ' 筆。');
if (blocked) console.log('⚠️ 有 ' + blocked + ' 個地區被 429 限流，稍後再跑一次即可。');
