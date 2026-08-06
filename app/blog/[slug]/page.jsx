import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/blog';
import { companyInfo, OFFICIAL_LINE_URL } from '@/lib/constants';

// Cloudflare Pages (@cloudflare/next-on-pages) 只支援 edge runtime 的動態路由，
// 且目前不支援 ISR，因此改用「每次請求都重新向 Supabase 抓取」確保內容即時。
// force-dynamic 是必要的：Next.js 預設會快取 Server Component 裡的 fetch()
// 結果（連 supabase-js 底層的 fetch 也一樣），沒有這行會讀到舊資料。
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: '找不到文章｜株式会社和日' };
  }

  const title = `${post.title}｜株式会社和日`;
  const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: post.excerpt,
      url,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      locale: 'zh_TW',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : []
    }
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const paragraphs = post.content.split('\n\n').filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: companyInfo.jpCompanyName },
    publisher: { '@type': 'Organization', name: companyInfo.jpCompanyName }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🏯</span> {companyInfo.jpCompanyName}
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← 返回房產新訊
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600">首頁</Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-blue-600">房產新訊</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">{post.title}</span>
        </nav>

        <div className="space-y-2">
          <span className="text-xs text-slate-400">{formatDate(post.published_at)}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">{post.title}</h1>
        </div>

        {post.cover_image && (
          <div className="h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-100">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="space-y-4 text-sm text-slate-700 leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <p className="text-sm text-slate-200">對大阪房地產投資有興趣？看看目前精選物件，或直接透過 LINE 詢問專員。</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/#properties"
              className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition"
            >
              瀏覽精選物件
            </Link>
            <a
              href={OFFICIAL_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5"
            >
              💬 LINE 諮詢
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <p>© 2026 株式会社和日 (Kazuhi Co., Ltd.). All rights reserved.</p>
      </footer>
    </div>
  );
}
