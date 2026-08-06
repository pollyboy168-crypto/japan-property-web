import { getSupabaseClient } from './supabase.js';

// news_posts 沒有 blog_posts 那種草稿/發布審核流程——新聞是每天自動抓取、
// 自動寫入即公開，設計上就不需要人工審核（跟部落格文章這種公司自己撰寫
// 的長文不同，新聞只是標題＋簡短原創引言＋連回原始來源，屬於新聞聚合而
// 非我們自己的深度內容）。
export async function getLatestNews(limit = 20) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ 讀取新聞失敗:', error);
    return [];
  }

  return data || [];
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
