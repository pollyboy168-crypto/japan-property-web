import Link from 'next/link';
import { getLatestNews } from '@/lib/news';
import { companyInfo } from '@/lib/constants';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態路由使用 edge runtime
// force-dynamic 避免 Next.js 把 Supabase 查詢結果快取住，確保新聞一寫入就看得到
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

export const metadata = {
  title: '大阪房產與旅遊熱門新聞｜株式会社和日',
  description: '每日更新的大阪不動產、民泊法規、觀光與投資相關新聞整理，株式会社和日整理給台灣買家的第一手資訊。',
  alternates: { canonical: `${SITE_URL}/news` }
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function NewsListPage() {
  const news = await getLatestNews(30);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">大阪房產與旅遊熱門新聞</h1>
          <p className="text-sm text-slate-500">每日整理大阪不動產、民泊法規、觀光與投資相關新聞，並附上原始來源連結</p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            目前還沒有新聞資料，明天再回來看看。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${encodeURIComponent(item.slug)}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{formatDate(item.published_at)}</span>
                    {item.category && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">{item.category}</span>}
                  </div>
                  <h2 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">{item.summary_zh}</p>
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
