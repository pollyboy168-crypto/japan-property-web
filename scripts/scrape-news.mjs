import { loadEnv, requireEnv, stamp } from './lib-env.mjs';

// ----------------------------------------------------------------
// 📰 台灣媒體新聞 + YouTube 影片抓取（本機執行）
//
// 原本跑在 n8n，2026-08-08 搬回本機。理由：n8n 是試用方案（約 8/19 到期），
// 到期後排程會直接停掉；而抓取本來就不需要跑在雲端，本機 IP 反而更乾淨
// （健美家已經把 n8n Cloud 的 IP 限流，見 scripts/scrape-kenbiya.mjs）。
//
// 影片為什麼不走 Google 新聞 RSS：RSS 的 <link> 是 news.google.com 轉址網址，
// 真正的目的地藏在 JS 後面（實測解不出來），拿不到 YouTube 影片 ID 就沒辦法
// 在站內嵌入播放。所以改成直接查 YouTube 搜尋頁，從 ytInitialData 取出真正的
// videoId。這條路不需要 YouTube Data API 金鑰，也就沒有配額與金鑰管理問題。
//
// 用法：
//   node scripts/scrape-news.mjs          # 抓取並寫入
//   node scripts/scrape-news.mjs --dry    # 只抓不寫，看結果
// ----------------------------------------------------------------

loadEnv();

const API = 'https://japan.her-yow.com/api/sync-news';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const NEWS_QUERIES = [
  { q: '大阪 房地產', cat: '不動產' },
  { q: '日本 買房 台灣人', cat: '不動產' },
  { q: '大阪 民泊 民宿 投資', cat: '民泊' },
  { q: '日本 不動產 投資 台灣', cat: '投資' },
  { q: '大阪 觀光 旅遊', cat: '觀光旅遊' }
];

// sp=EgQIBRAB → 上傳時間「本月內」＋類型「影片」，確保抓到的是近期內容
const YT_QUERIES = ['大阪 買房 投資', '日本 房地產 大阪', '大阪 民宿 投資', '日本買房 台灣人'];
const YT_SP = 'EgQIBRAB';

// 標題至少要命中一個主題關鍵字才收，避免抓到純旅遊 vlog 之類的無關影片
const TOPIC_WORDS = ['大阪', '日本', '房', '不動產', '不动产', '民宿', '民泊', '置產', '投資', '投资'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
const stripTags = (s) => decodeEntities(String(s || '').replace(/<[^>]*>/g, '')).trim();

// ⚠️ slug 一定要是純 ASCII。Cloudflare Pages 的路由層會讓含非 ASCII 的路徑
// 一律 404（中文 slug 實測不論怎麼編碼都 404），而且應用層修不了。所以不能
// 用中文標題組 slug，改用來源網址裡本來就是 ASCII 的文章 id。
function slugFor(link) {
  const m = String(link).match(/\/articles\/([\w-]{10,})/);
  if (m) return 'news-' + m[1].slice(0, 28).toLowerCase();
  let h = 0;
  for (const ch of String(link)) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return 'news-' + Math.abs(h).toString(36);
}

// YouTube 只給「3 天前」這種相對時間，換算成大概的絕對日期。
// 只用來排序與顯示，差一兩天不影響。
function relativeToISO(text) {
  const m = String(text || '').match(/(\d+)\s*(分鐘|小時|天|週|周|個月|月|年)/);
  if (!m) return new Date().toISOString();
  const unitMs = {
    分鐘: 60e3, 小時: 3600e3, 天: 864e5, 週: 7 * 864e5,
    周: 7 * 864e5, 個月: 30 * 864e5, 月: 30 * 864e5, 年: 365 * 864e5
  }[m[2]];
  return new Date(Date.now() - +m[1] * unitMs).toISOString();
}

const isRelevant = (t) => TOPIC_WORDS.some((w) => t.includes(w));
// 日文原文新聞對台灣買家可讀性差，用假名判斷擋掉（繁體中文不會有假名）
const hasKana = (t) => /[぀-ゟ゠-ヿ]/.test(t);

// ytInitialData 是一大包巢狀 JSON，videoRenderer 埋在不固定的深度，
// 所以直接遞迴走訪把所有 videoRenderer 撈出來，不去猜路徑。
function collectVideos(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const x of node) collectVideos(x, out);
    return;
  }
  if (node.videoRenderer) out.push(node.videoRenderer);
  for (const k of Object.keys(node)) collectVideos(node[k], out);
}

async function get(url, extraHeaders = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...extraHeaders } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.text();
}

const records = [];
const seen = new Set();

// ================= 圖文新聞 =================
for (const { q, cat } of NEWS_QUERIES) {
  try {
    const xml = await get(
      'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=zh-TW&gl=TW&ceid=TW:zh-Hant'
    );
    const items = xml.split('<item>').slice(1, 9);
    let added = 0;
    for (const it of items) {
      const title = stripTags((it.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
      const link = stripTags((it.match(/<link>([\s\S]*?)<\/link>/) || [])[1]);
      const src = stripTags((it.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1]);
      const pub = stripTags((it.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]);
      if (!title || !link || hasKana(title) || !isRelevant(title)) continue;

      const slug = slugFor(link);
      if (seen.has(slug)) continue;
      seen.add(slug);
      records.push({
        slug,
        title: title.slice(0, 200),
        summary_zh: ('【台灣媒體報導】' + title).slice(0, 480),
        source_name: src || '台灣媒體',
        source_url: link,
        category: cat,
        published_at: pub ? new Date(pub).toISOString() : new Date().toISOString()
      });
      added++;
    }
    console.log(`  ✓ 新聞「${q}」：${added} 筆`);
    await sleep(400);
  } catch (e) {
    console.log(`  ✗ 新聞「${q}」失敗：${e.message}`);
  }
}

// ================= YouTube 影片 =================
for (const q of YT_QUERIES) {
  try {
    const html = await get(
      'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=' + YT_SP + '&hl=zh-TW&gl=TW',
      { 'Accept-Language': 'zh-TW,zh;q=0.9' }
    );
    const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
    if (!m) {
      console.log(`  ✗ 影片「${q}」：找不到 ytInitialData`);
      continue;
    }
    const vids = [];
    collectVideos(JSON.parse(m[1]), vids);
    let added = 0;
    for (const v of vids.slice(0, 10)) {
      const id = v.videoId;
      const title = ((v.title && v.title.runs) || []).map((r) => r.text).join('');
      const ch = (((v.ownerText && v.ownerText.runs) || [])[0] || {}).text || 'YouTube';
      if (!id || !title || hasKana(title) || !isRelevant(title)) continue;

      // 影片一律用 yt-<videoId> 當 slug：同一支影片在不同查詢重複出現會自然
      // 收斂成同一筆，標題改了也不會變成新的一筆。
      const slug = 'yt-' + id;
      if (seen.has(slug)) continue;
      seen.add(slug);
      records.push({
        slug,
        title: title.slice(0, 200),
        summary_zh: ('【台灣媒體影片】' + title).slice(0, 480),
        source_name: ch,
        source_url: 'https://www.youtube.com/watch?v=' + id,
        category: '影片',
        image_url: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg',
        published_at: relativeToISO((v.publishedTimeText || {}).simpleText)
      });
      added++;
    }
    console.log(`  ✓ 影片「${q}」：${added} 筆`);
    await sleep(500);
  } catch (e) {
    console.log(`  ✗ 影片「${q}」失敗：${e.message}`);
  }
}

const videos = records.filter((r) => r.category === '影片').length;
console.log(`\n[${stamp()}] 共整理 ${records.length} 筆（影片 ${videos} / 圖文 ${records.length - videos}）`);

if (!records.length) {
  console.log('沒有可寫入的資料，結束。');
  process.exit(0);
}
if (process.argv.includes('--dry')) {
  console.log('--dry：未寫入。');
  process.exit(0);
}

const res = await fetch(API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + requireEnv('SYNC_SECRET') },
  body: JSON.stringify({ records })
});
const body = await res.text();
if (!res.ok) {
  console.error('同步 API 失敗 ' + res.status + '：' + body.slice(0, 200));
  process.exit(1);
}
console.log('寫入完成：' + body.slice(0, 200));
