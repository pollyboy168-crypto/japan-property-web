import { useMemo } from 'react';
import { formatPropertyPrice } from '@/lib/constants';

const PRICE_STEPS_JPY = [
  { label: '不限價格', value: '' },
  { label: '3,000 萬以下', value: 30000000 },
  { label: '5,000 萬以下', value: 50000000 },
  { label: '8,000 萬以下', value: 80000000 },
  { label: '1 億以下', value: 100000000 },
  { label: '1.5 億以下', value: 150000000 }
];

// 大型房產網站常見的三種篩選條件：關鍵字（地點/標題）、區域、總價上限。
// 全部在前端對已經抓好的 properties 陣列做篩選，不額外打 Supabase 查詢
// （資料量只有幾百筆，前端篩選成本很低，跟現有分頁邏輯一致）。
export default function PropertyFilterBar({ properties, keyword, onKeywordChange, region, onRegionChange, maxPrice, onMaxPriceChange, resultCount }) {
  const regions = useMemo(() => {
    const set = new Set();
    properties.forEach((item) => {
      // 從「大阪府大阪市中央区...」這類地址擷取到市/區層級當作篩選選項
      const match = item.location?.match(/大阪[府市]?([^\d]{2,6}[市区町村])/);
      if (match) set.add(match[1]);
    });
    return [...set].sort();
  }, [properties]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="🔍 搜尋物件名稱或地點關鍵字"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />

        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          <option value="">不限區域</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        >
          {PRICE_STEPS_JPY.map((step) => (
            <option key={step.label} value={step.value}>
              {step.value ? `${step.label}（${formatPropertyPrice(step.value, 'JPY')}）` : step.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-400">符合條件：<span className="font-bold text-blue-600">{resultCount}</span> 筆物件</p>
    </div>
  );
}
