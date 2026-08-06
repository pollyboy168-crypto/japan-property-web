import PropertyCard from '@/components/PropertyCard';
import { formatPropertyPrice } from '@/lib/constants';

export default function PropertyGrid({
  propertiesCount,
  currentProperties,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  currency,
  onViewGallery
}) {
  return (
    <section id="properties" className="scroll-mt-20 space-y-6">

      {/* 區塊標題 + 頂部快速分頁按鈕 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">精選與全網即時投資物件</h2>
          <p className="text-slate-500 text-sm mt-1">即時同步日本地產數據，具備 365 天特區民泊與高收益回報之標的</p>
        </div>

        {/* 頂部快捷換頁控制列 */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">
            共 <span className="text-blue-600 font-bold">{propertiesCount}</span> 筆 ｜ <span className="text-slate-900 font-bold">{currentPage}</span> / {totalPages || 1} 頁
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ◀ 上頁
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              下頁 ▶
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="animate-spin text-3xl mb-2">🌀</div>
          正在載入最新 400+ 筆大阪物業資料庫...
        </div>
      ) : (
        <>
          {/* 物件卡片網格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentProperties.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                priceLabel={formatPropertyPrice(item.priceJPY, currency)}
                onViewGallery={onViewGallery}
              />
            ))}
          </div>

          {/* 底部分頁頁碼選單 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                ◀ 上一頁
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                下一頁 ▶
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
