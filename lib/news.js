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

export async function getLatestNews(limit = 20) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit * 3);

  if (error) {
    console.error('❌ 讀取新聞失敗:', error);
    return [];
  }

  return (data || [])
    .filter((item) => !(item.summary_zh || '').startsWith(LEGACY_JP_PREFIX))
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
