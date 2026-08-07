import Link from 'next/link';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' });
}

// 首頁「熱門新聞」摘要區塊，資料來自 lib/news.js 的 getLatestNews()。
// 沒有新聞資料時整個區塊不渲染，不強迫顯示空狀態（跟 RecentlyViewedRail 一致的設計）。
export default function NewsRail({ news }) {
  if (!news || news.length === 0) return null;

  const items = news.slice(0, 6);

  return (
    <section id="news" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">大阪房產與旅遊熱門新聞</h2>
          <p className="text-slate-500 text-sm mt-1">每日更新，掌握大阪不動產、民泊法規、觀光與投資最新動態</p>
        </div>
        <Link href="/news" className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0">
          查看所有新聞 →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${encodeURIComponent(item.slug)}`}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition space-y-2"
          >
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{formatDate(item.published_at)}</span>
              {item.category && (
                <span className={`px-1.5 py-0.5 rounded font-medium ${item.category === '影片' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                  {item.category === '影片' ? '▶️ 影片' : item.category}
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">{item.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.summary_zh}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
