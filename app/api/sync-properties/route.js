// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
export const runtime = 'edge';

// ----------------------------------------------------------------
// 🏠 真實物件資料同步：取代原本 n8n 裡「假造 20 筆」的邏輯
//
// 原本 n8n 流程對 10 個來源網站的「列表頁」做純文字 regex 抓取，抓不到就
// 用假圖／假文案硬湊出 20 筆，導致 properties 表裡幾乎全是假資料。
//
// 這支 API 改成只鎖定「健美家」(Kenbiya) —— 唯一一個同時符合「大阪」
// 「收益物件」「靜態 HTML 就含真實圖片與完整文案，不需要 JS 渲染」三個條件、
// 而且沒有反爬蟲阻擋的來源（其餘 9 個來源已實測：403／404／連線失敗，見
// CLAUDE.md 的調查紀錄）。抓的是「列表頁 → 抓出真實物件詳情頁連結 →
// 逐一抓詳情頁」，不是列表頁本身的 meta 描述，所以每一筆都有真實的
// 標題／價格／利回り／地址／至少 1-2 張真實照片／仲介公司撰寫的完整介紹文。
//
// 由 n8n 既有的 Schedule Trigger 每天呼叫這支 API 觸發（見 CLAUDE.md），
// 這支 API 本身不會被排程，純粹是「被叫了就做一次同步」。
// ----------------------------------------------------------------

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const KENBIYA_BASE = 'https://www.kenbiya.com';

// 大阪市／堺市各抓前兩頁列表（每頁約 19 筆真實連結），足夠湊出穩定的一批真實物件，
// 同時遠低於 Cloudflare edge 每次請求的 subrequest 上限。
const LISTING_PAGES = [
  `${KENBIYA_BASE}/pp3/k/osaka/osaka-shi/1/`,
  `${KENBIYA_BASE}/pp3/k/osaka/osaka-shi/2/`,
  `${KENBIYA_BASE}/pp3/k/osaka/sakai-shi/1/`
];

const MAX_LISTINGS = 24;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
    }
  });
  if (!res.ok) return null;
  return res.text();
}

async function collectDetailUrls(debug) {
  const urls = new Set();

  for (const listingUrl of LISTING_PAGES) {
    const html = await fetchHtml(listingUrl);
    if (debug) {
      debug.push({ url: listingUrl, htmlLength: html ? html.length : 0, sample: html ? html.slice(0, 300) : null });
    }
    if (!html) continue;

    const matches = html.matchAll(/href="(\/pp3\/k\/osaka\/[a-z0-9-]+\/\d+\/re_[a-z0-9]+\/)"/gi);
    for (const m of matches) {
      urls.add(KENBIYA_BASE + m[1]);
      if (urls.size >= MAX_LISTINGS) break;
    }
    if (urls.size >= MAX_LISTINGS) break;
  }

  return [...urls];
}

function parsePrice(html) {
  const block = html.match(/<dt>価格<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  if (!block) return null;

  const plain = stripTags(block[1]);
  const m = plain.match(/(?:(\d+)億)?([\d,]+)万円/);
  if (!m) return null;

  const oku = m[1] ? parseInt(m[1], 10) : 0;
  const man = parseInt(m[2].replace(/,/g, ''), 10);
  return oku * 100000000 + man * 10000;
}

function parseRoi(html) {
  const block = html.match(/rimawari_value"[^>]*>([\s\S]*?)％/);
  if (!block) return null;
  const plain = stripTags(block[1]).replace(/\s/g, '');
  const val = parseFloat(plain);
  return Number.isFinite(val) ? val : null;
}

function parseAddress(html) {
  const block = html.match(/<dt>住所<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  if (!block) return null;
  return stripTags(block[1]) || null;
}

function parseType(html) {
  const m = html.match(/<span>([^<]+?)の詳細<\/span>/);
  return m ? m[1].trim() : '収益不動産';
}

function parseTitle(html) {
  const m = html.match(/<h1>([^<]+)<\/h1>/);
  return m ? stripTags(m[1]) : null;
}

function parseImages(html) {
  const matches = [...html.matchAll(/\/upload\/p\d+\/\d+\/[^"]+\.(?:jpg|jpeg|png)/gi)];
  const unique = [...new Set(matches.map((m) => KENBIYA_BASE + m[0]))];
  return unique.slice(0, 8);
}

function parseDescription(html) {
  const remarkBlock = html.match(/<h3>備考<\/h3>\s*<div class="inner">\s*<div>([\s\S]*?)<\/div>/);
  const remark = remarkBlock ? stripTags(remarkBlock[1]) : '';

  const commentBlock = html.match(/box_comment">\s*<p>([\s\S]*?)<\/p>/);
  const comment = commentBlock ? stripTags(commentBlock[1]) : '';

  const combined = [remark, comment].filter(Boolean).join('\n\n');
  return combined.slice(0, 1500) || null;
}

function parseListingId(url) {
  const m = url.match(/re_([a-z0-9]+)\/?$/i);
  return m ? m[1] : null;
}

async function parseDetailPage(url) {
  const html = await fetchHtml(url);
  if (!html) return null;

  const listingId = parseListingId(url);
  const title = parseTitle(html);
  const priceJpy = parsePrice(html);
  const images = parseImages(html);

  // 缺標題／缺價格／完全沒有真實照片的，寧可跳過也不要用假資料湊數
  if (!listingId || !title || !priceJpy || images.length === 0) {
    return null;
  }

  return {
    id: `KENBIYA-${listingId}`,
    title_zh: `【健美家】${title}`,
    price_jpy: priceJpy,
    price_twd: Math.round((priceJpy * 0.21) / 10000),
    location: parseAddress(html) || '大阪府',
    roi: parseRoi(html) || 0,
    type: parseType(html),
    image_url: images[0],
    images,
    original_url: url,
    description_zh: parseDescription(html) || `${title}。詳情請洽詢。`,
    line_link: null
  };
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

async function runSync(debugInfo) {
  const detailUrls = await collectDetailUrls(debugInfo);

  const results = [];
  const BATCH = 5;
  for (let i = 0; i < detailUrls.length; i += BATCH) {
    const batch = detailUrls.slice(i, i + BATCH);
    const parsed = await Promise.all(batch.map((u) => parseDetailPage(u).catch(() => null)));
    results.push(...parsed);
  }

  const records = results.filter(Boolean);

  if (records.length > 0) {
    await upsertProperties(records);
  }

  return {
    listingUrlsScanned: LISTING_PAGES.length,
    detailUrlsFound: detailUrls.length,
    propertiesUpserted: records.length,
    skipped: detailUrls.length - records.length,
    ids: records.map((r) => r.id)
  };
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

  try {
    const debug = new URL(request.url).searchParams.has('debug') ? [] : null;
    const summary = await runSync(debug);
    return json({ ok: true, ...summary, debug });
  } catch (err) {
    console.error('❌ 物件同步失敗:', err);
    return json({ error: String(err) }, 500);
  }
}
