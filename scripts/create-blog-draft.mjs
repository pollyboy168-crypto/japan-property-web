// 本機維護用腳本，不是網站路由，也不會被部署。
// 用途：把一篇文章以 status='draft' 寫入 Supabase 的 blog_posts 資料表，
// 供使用者之後在 Supabase Table Editor 手動審核並翻成 published。
//
// 這裡刻意不 import lib/blog.js——專案 package.json 沒有設定
// "type": "module"（next.config.js 等設定檔仍是 CommonJS 語法，不能改），
// 用純 Node 直接執行 .js 檔案時會被當成 CommonJS 解析、無法讀懂 lib/ 裡的
// ESM `export` 語法，所以這裡改用同一支 @supabase/supabase-js 自己補一份
// 最小邏輯，欄位與 RLS 限制（anon key 只能寫入 status='draft'）跟
// lib/blog.js 的 createDraftPost() 完全一致。
//
// 用法：
//   node --env-file=.env.local scripts/create-blog-draft.mjs scripts/drafts/<檔名>.json
//
// draft JSON 格式：
//   { "slug": "...", "title": "...", "excerpt": "...", "content": "...", "cover_image": "..." }
//   content 用 "\n\n" 分段落，會在文章頁被切成多個 <p>。

import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const draftPath = process.argv[2];
if (!draftPath) {
  console.error('用法: node --env-file=.env.local scripts/create-blog-draft.mjs <draft.json 路徑>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('❌ 缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY，請用 --env-file=.env.local 執行。');
  process.exit(1);
}

const raw = await readFile(draftPath, 'utf-8');
const draft = JSON.parse(raw);

for (const field of ['slug', 'title', 'excerpt', 'content']) {
  if (!draft[field]) {
    console.error(`❌ draft JSON 缺少必填欄位: ${field}`);
    process.exit(1);
  }
}

const supabase = createClient(url, anonKey);

// 刻意不接 .select()：SELECT 的 RLS policy 只允許讀 status='published' 的資料，
// 剛寫入的 draft 讀不回來會被誤判成 RLS 違規，這裡插入成功與否只看 error。
const { error } = await supabase
  .from('blog_posts')
  .insert({
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    content: draft.content,
    cover_image: draft.cover_image || null,
    status: 'draft'
  });

if (error) {
  console.error('❌ 寫入草稿失敗:', error.message);
  process.exit(1);
}

console.log(`✅ 草稿已寫入: /blog/${draft.slug}（status=draft，尚未公開）`);
console.log('請到 Supabase Table Editor 審核內容，確認沒問題後把該筆 status 改成 published 即可上線。');
