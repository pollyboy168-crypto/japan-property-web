import Link from 'next/link';

export default function PropertyCard({ item, priceLabel, onViewGallery }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">

      {/* 物件封面圖與開相簿 */}
      <div className="relative h-48 bg-slate-100 cursor-pointer group" onClick={() => onViewGallery(item)}>
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm bg-slate-900/80 text-white">
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
          📷 觀看相簿 ({item.images.length})
        </div>
      </div>

      {/* 物件內文區 */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="text-xs text-blue-600 font-semibold">📍 {item.location} ‧ {item.structure}</span>
          <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">{item.title}</h3>

          {/* 智慧動態描述 */}
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{item.description}</p>

          <Link
            href={`/properties/${encodeURIComponent(item.id)}`}
            className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            查看完整介紹 →
          </Link>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 block">預售總價 (加價 30% 包套價)</span>
              <span className="font-black text-blue-600 text-xl">
                {priceLabel}
              </span>
            </div>
          </div>

          {/* 雙按鈕功能 */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewGallery(item)}
              className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1"
            >
              📷 看實景照片
            </button>
            <a
              href={item.lineLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="透過 LINE 詢問此物件"
              title="透過 LINE 詢問此物件"
              className="shrink-0 w-11 text-center border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-base font-bold py-2.5 rounded-lg transition flex items-center justify-center"
            >
              💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
