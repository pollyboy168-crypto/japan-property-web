import Link from 'next/link';
import { formatPropertyPrice } from '@/lib/constants';

// server-safe：不需要任何 client hooks，物件詳情頁（server component）直接渲染即可。
export default function SimilarProperties({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">你可能也喜歡</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/properties/${encodeURIComponent(item.id)}`}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="h-28 bg-slate-100">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 block">📍 {item.location}</span>
              <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-xs font-black text-blue-600">{formatPropertyPrice(item.priceJPY, 'JPY')}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">預估 ROI {item.roi}%</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
