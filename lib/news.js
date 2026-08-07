import { getSupabaseClient } from './supabase.js';

// news_posts 沒有 blog_posts 那種草稿/發布審核流程——新聞是每天自動抓取、
// 自動寫入即公開，設計上就不需要人工審核（跟部落格文章這種公司自己撰寫
// 的長文不同，新聞只是標題＋簡短原創引言＋連回原始來源，屬於新聞聚合而
// 非我們自己的深度內容）。
// 2026-08-07 起新聞來源改成台灣媒體（Google News 台灣版），摘要開頭一律是
// 「【台灣媒體報導】」或「【台灣媒體影片】」。更早之前抓的是日文原文新聞
// （摘要開頭是「【日本新聞】」），對台灣買家可讀性差，這裡直接濾掉不顯示。
// 那批舊資料還留在 news_posts 表裡沒清掉——news_posts 的 RLS 沒有 DELETE
// policy，anon key 刪不動（會靜默刪 0 筆），要清得從 Supabase SQL Editor
// 用 postgres role 執行 `delete from news_posts where summary_zh like '%【日本新聞】%';`。
const LEGACY_JP_PREFIX = '【日本新聞】';

// ⚠️ 非 ASCII 的 slug 在 Cloudflare Pages 上一定是 404。
// 2026-08-07 實測：中文 slug（例如 /news/大阪地產黃金期-李丹翔-東周刊）不論
// 用百分比編碼或雙重編碼都回 404，而同一批 ASCII slug 全部正常——擋下來的是
// Cloudflare 的路由層，請求根本到不了我們的程式碼，所以應用層修不了。
// n8n 那邊已改成一律產生 ASCII slug，但資料庫裡還留著 38 筆中文 slug 的舊資料：
// news_posts 的 RLS 只有 insert + select，**沒有 UPDATE / DELETE policy**，
// 用 anon key 送 PATCH／DELETE 會回 204 但實際改 0 筆（靜默失敗），改不動。
// 所以這裡直接濾掉——不濾的話 sitemap 會塞 38 個 404 給 Google，非常傷索引信任度。
// 要真正清掉得到 Supabase SQL Editor 用 postgres role 執行（見本檔尾註與 CLAUDE.md）。
function isReachable(item) {
  const slug = item && item.slug;
  // eslint-disable-next-line no-control-regex
  return typeof slug === 'string' && /^[\x00-\x7F]+$/.test(slug);
}

export async function getLatestNews(limit = 20) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })
    // 目前 107 筆裡有 53 筆會被下面兩道濾網擋掉（15 筆舊日文 + 38 筆中文 slug），
    // 倍率抓太小會出現「明明有資料卻湊不滿 limit」的情況，所以多抓一些再切。
    .limit(Math.min(limit * 6, 500));

  if (error) {
    console.error('❌ 讀取新聞失敗:', error);
    return [];
  }

  return (data || [])
    .filter((item) => !(item.summary_zh || '').startsWith(LEGACY_JP_PREFIX))
    .filter(isReachable)
    .slice(0, limit);
}

export async function getNewsBySlug(slug) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return data;
}
