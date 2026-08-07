import PropertyCard from '@/components/PropertyCard';
import { formatPropertyPrice } from '@/lib/constants';

// 分頁改成「載入更多」模式（取代原本的頁碼分頁）：手機窄版面下頁碼分頁
// 很難感覺到「換頁了」，改成新卡片直接接在後面出現，捲動軌跡連續、
// 使用者一看就知道有新內容進來——這是購物網站商品牆很常見的做法。
// 「只看收藏」的檢視入口已經移到右下角浮動的 FavoritesCartWidget（愛心
// 圖示），這裡不再重複提供切換鈕，避免同一個功能有兩個入口造成混淆。
export default function PropertyGrid({
  propertiesCount,
  visibleProperties,
  hasMore,
  onLoadMore,
  loading,
  currency,
  onViewGallery,
  onToggleFavorite
}) {
  return (
    <section id="properties" className="scroll-mt-20 space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">精選與全網即時投資物件</h2>
          <p className="text-slate-500 text-sm mt-1">即時同步日本地產數據，具備 365 天特區民泊與高收益回報之標的</p>
        </div>

        <span className="text-xs text-slate-500 font-medium bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          共 <span className="text-blue-600 font-bold">{propertiesCount}</span> 筆符合條件
        </span>
      </div>

      {!loading && propertiesCount === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          沒有符合篩選條件的物件，試試調整搜尋關鍵字或區域。
        </div>
      ) : loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="animate-spin text-3xl mb-2">🌀</div>
          正在載入最新大阪物業資料庫...
        </div>
      ) : (
        <>
          {/* 物件卡片網格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleProperties.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                priceLabel={formatPropertyPrice(item.priceJPY, currency)}
                marketPriceLabel={formatPropertyPrice(item.marketPriceJPY, currency)}
                onViewGallery={onViewGallery}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          {/* 載入更多 */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={onLoadMore}
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition text-sm"
              >
                載入更多物件 ({visibleProperties.length} / {propertiesCount})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
