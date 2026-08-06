import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// 💡 Supabase Client 初始化設定
// 金鑰一律從環境變數讀取，Cloudflare Pages 專案設定裡必須配置
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY（見 CLAUDE.md）
// 這是唯一一把 anon public key，只讀資料表（properties、blog_posts 已發布文章）
// 走這裡拿 client；blog_posts 的草稿新增走同一把 key，但受 RLS INSERT policy
// 限制只能寫入 status='draft' 的資料列。
// ----------------------------------------------------------------
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 環境變數，請參考 .env.local.example 設定。');
  }

  return createClient(url, anonKey);
}
