import { getSupabaseClient } from './supabase.js';

export async function getPublishedPosts() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ 讀取部落格文章失敗:', error);
    return [];
  }

  return data || [];
}

// 多加 status='published' 條件，即使有人猜到草稿的 slug 也查不到，
// 是 RLS INSERT-only policy 之外的第二層防護。
export async function getPostBySlug(slug) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;

  return data;
}

// anon key 受 RLS INSERT policy 限制只能寫入 status='draft'，這裡直接把
// status 寫死，不接受呼叫端覆寫，避免不小心繞過「草稿必須人工審核才能發布」
// 這個流程。刻意不接 .select()：SELECT policy 只允許讀 status='published'
// 的資料，剛寫入的 draft 讀不回來會被誤判成 RLS 違規。
export async function createDraftPost({ slug, title, excerpt, content, cover_image }) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('blog_posts')
    .insert({ slug, title, excerpt, content, cover_image, status: 'draft' });

  if (error) {
    throw new Error(`寫入草稿失敗: ${error.message}`);
  }
}
