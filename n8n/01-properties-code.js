// ===== 01_大阪物件同步（健美家 Kenbiya）=====
//
// ⚠️ 輪替索引一定要「每次執行都前進」，不能綁日期。
// 原本寫 new Date().getDate() % CITY_GROUPS.length（依當月第幾天輪替），
// 一天只跑一次時沒問題；但改成每 30 分鐘跑一次之後，一整天 48 次執行全部
// 落在同一組地區、重複抓同一批物件，upsert 回去還是那幾筆，物件總數完全
// 不會成長。改成用「30 分鐘為一格的時間戳」當索引，每跑一次就換下一組。
//
// 2026-08-07 實測：健美家大阪 54 個地區分頁共約 1184 筆不重複物件
// （部分分頁剛好 50 筆代表分頁後面還有），所以 1000 筆目標可達成。
// 詳情頁解析成功率 35/36，抓 36 筆只花 6.6 秒，60 秒逾時很寬裕。

const SUPA = 'https://nfegislkpuzqylwcfnoc.supabase.co';
const SUPA_KEY = 'sb_publishable_ceNh3H1XvVzubJW7uKv3Rw_pujGphDu';
const TARGET = 1000;

const BASE = 'https://www.kenbiya.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const http = this.helpers.httpRequest.bind(this.helpers);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 大阪全部可抓的地區分頁（大阪市 24 區 + 堺市各區 + 府內各市）
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

// 每次執行的量：受 n8n 60 秒逾時限制，也刻意不要對健美家太兇
// （之前 35 個並行請求打過去整批 429，冷卻很久）
const SEG_PER_RUN = 4;
const MAX_DETAILS = 90;
const BATCH = 5;
const BATCH_GAP = 800;

const SLOT = Math.floor(Date.now() / (30 * 60 * 1000));
const start = (SLOT * SEG_PER_RUN) % SEGMENTS.length;
const todo = [];
for (let i = 0; i < SEG_PER_RUN; i++) todo.push(SEGMENTS[(start + i) % SEGMENTS.length]);

function text(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// 詳情頁欄位都是 <dt>標籤</dt><dd>值</dd>。同一頁下方還有一份「用語說明」
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

const TYPES = [
  '一棟売りマンション', '一棟マンション', '一棟売りアパート', '一棟アパート',
  '区分マンション', '戸建賃貸', 'ビル', '店舗', '事務所', 'テナント', '土地'
];

function parseDetail(h, url) {
  const id = 'KENBIYA-' + (url.match(/re_(\w+)/) || [])[1];
  const title = text((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  const price = parsePriceJPY(dd(h, '価格'));
  const roi = parseFloat(
    (dd(h, '利回り').replace(/\s/g, '').match(/([\d.]+)\s*[%％]/) || [])[1] || 0
  );
  // 欄位標籤是「住所」不是「所在地」——「所在地」只出現在下方用語說明區
  const address = dd(h, '住所') || dd(h, '所在地');
  const access = dd(h, '交通');
  // 沒有獨立的物件種別欄位，型態寫在 h1 標題尾巴（例：「大阪市生野区 一棟マンション」）
  const type = TYPES.find((t) => title.includes(t)) || dd(h, '建物構造') || '収益物件';

  // 物件照片路徑固定是 /upload/p<群組>/<物件編號>/…，
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

// ---------- 先看現在有幾筆、哪些已經抓過 ----------
let existing = new Set();
let total = 0;
try {
  const arr = await http({
    url: SUPA + '/rest/v1/properties?select=id',
    headers: {
      apikey: SUPA_KEY,
      Authorization: 'Bearer ' + SUPA_KEY,
      Range: '0-1999'
    },
    json: true,
    timeout: 15000
  });
  if (Array.isArray(arr)) {
    existing = new Set(arr.map((r) => r.id));
    total = arr.length;
  }
} catch (e) {
  // 讀不到就當作還沒滿，照常抓
}

// 達標就整個跳過：不再打健美家，也不浪費 n8n 執行額度。
// 補滿之後排程可以改回一天一次，但就算忘了改，這個保險也會讓它變成空轉。
if (total >= TARGET) {
  return [{ json: { skipped: true, reason: '已達 ' + TARGET + ' 筆目標', total } }];
}

// ---------- 抓列表頁，取出這輪要處理的詳情頁 ----------
const detailPaths = [];
for (const seg of todo) {
  try {
    const html = await http({
      url: BASE + '/pp3/k/osaka/' + seg,
      headers: { 'User-Agent': UA },
      timeout: 15000
    });
    const found = String(html).match(/\/pp3\/k\/osaka\/[a-z0-9\-]+\/(?:\d+\/)?re_\w+\//g) || [];
    for (const p of found) if (!detailPaths.includes(p)) detailPaths.push(p);
  } catch (e) {
    // 單一地區失敗就跳過，不要讓整批掛掉
  }
  await sleep(500);
}

// 已經在資料庫裡的先濾掉，把時間預算全部花在「新物件」上
const fresh = detailPaths.filter(
  (p) => !existing.has('KENBIYA-' + (p.match(/re_(\w+)/) || [])[1])
);

const records = [];
for (let i = 0; i < fresh.length && records.length < MAX_DETAILS; i += BATCH) {
  const got = await Promise.all(
    fresh.slice(i, i + BATCH).map(async (p) => {
      try {
        const h = await http({ url: BASE + p, headers: { 'User-Agent': UA }, timeout: 12000 });
        return parseDetail(String(h), BASE + p);
      } catch (e) {
        return null;
      }
    })
  );
  for (const r of got) if (r) records.push(r);
  await sleep(BATCH_GAP);
}

if (!records.length) {
  return [{ json: { records: [], note: '這輪沒有新物件', total, segments: todo } }];
}

return [
  {
    json: {
      records,
      total_before: total,
      segments: todo,
      listing_found: detailPaths.length,
      new_candidates: fresh.length,
      scraped: records.length
    }
  }
];
