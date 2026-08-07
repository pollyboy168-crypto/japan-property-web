import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsBySlug } from '@/lib/news';
import { companyInfo, OFFICIAL_LINE_URL } from '@/lib/constants';

// Cloudflare Pages (@cloudflare/next-on-pages) 只支援 edge runtime 的動態路由，
// 且目前不支援 ISR，因此改用「每次請求都重新向 Supabase 抓取」確保內容即時。
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 出站連結掛上 UTM 參數，讓對方站台（以及我們自己的 GA4 出站點擊追蹤）
// 認得出這個流量是從株式会社和日官網送過去的，方便日後談合作／衡量導流成效。
function withReferralParams(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set('utm_source', 'japan.her-yow.com');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'kazuhi_news');
    return url.toString();
  } catch (e) {
    return rawUrl;
  }
}

export async function generateMetadata({ params }) {
  const item = await getNewsBySlug(params.slug);

  if (!item) {
    return { title: '找不到新聞｜株式会社和日' };
  }

  const title = `${item.title}｜株式会社和日`;
  const url = `${SITE_URL}/news/${encodeURIComponent(item.slug)}`;

  return {
    title,
    description: item.summary_zh,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: item.summary_zh,
      url,
      images: item.image_url ? [{ url: item.image_url }] : [],
      locale: 'zh_TW',
      type: 'article'
    }
  };
}

export default async function NewsDetailPage({ params }) {
  const item = await getNewsBySlug(params.slug);

  if (!item) {
    notFound();
  }

  const url = `${SITE_URL}/news/${encodeURIComponent(item.slug)}`;
  const isVideoItem = item.category === '影片' || item.source_name === 'YouTube';

  // 這裡刻意不整篇轉載來源新聞內容，只放我們自己寫的簡短引言＋連回原始
  // 來源，避免版權疑慮（見 lib/news.js／app/api/sync-news/route.js 的說明）。
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.summary_zh,
    url,
    image: item.image_url ? [item.image_url] : undefined,
    datePublished: item.published_at,
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
          <Link href="/news" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← 返回熱門新聞
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600">首頁</Link>
          <span className="mx-1.5">/</span>
          <Link href="/news" className="hover:text-blue-600">熱門新聞</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">{item.title}</span>
        </nav>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{formatDate(item.published_at)}</span>
            {item.category && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">{item.category}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">{item.title}</h1>
        </div>

        {item.image_url && (
          <div className="h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-100">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>{item.summary_zh}</p>
        </article>

        <a
          href={withReferralParams(item.source_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition"
        >
          {isVideoItem ? '▶️ 觀看完整影片' : '📰 閱讀原文'}（{item.source_name}）→
        </a>

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
