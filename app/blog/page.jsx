import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { companyInfo } from '@/lib/constants';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
// force-dynamic 避免 Next.js 把 Supabase 查詢結果快取住，確保文章一發布就看得到
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

export const metadata = {
  title: '日本房產新訊｜株式会社和日',
  description: '大阪不動產與民泊法規最新消息、投資觀點與市場動態，株式会社和日整理給台灣買家的第一手資訊。',
  alternates: { canonical: `${SITE_URL}/blog` }
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🏯</span> {companyInfo.jpCompanyName}
          </Link>
          <Link href="/#properties" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← 返回精選物件
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">日本房產新訊</h1>
          <p className="text-sm text-slate-500">大阪不動產與民泊法規最新消息、投資觀點與市場動態</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            目前還沒有發布的文章，敬請期待。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${encodeURIComponent(post.slug)}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                {post.cover_image && (
                  <div className="h-44 bg-slate-100">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <span className="text-xs text-slate-400">{formatDate(post.published_at)}</span>
                  <h2 className="font-bold text-base text-slate-900 leading-snug">{post.title}</h2>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed flex-1">{post.excerpt}</p>
                  <span className="text-xs font-semibold text-blue-600">閱讀更多 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <p>© 2026 株式会社和日 (Kazuhi Co., Ltd.). All rights reserved.</p>
      </footer>
    </div>
  );
}
