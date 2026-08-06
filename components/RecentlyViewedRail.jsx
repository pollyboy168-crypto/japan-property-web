'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentlyViewed } from '@/lib/clientStorage';
import { formatPropertyPrice } from '@/lib/constants';

// 用首頁已經抓好的 properties 陣列交叉比對，不重新 fetch。
// 只顯示訪客自己真實看過的物件，localStorage 沒有紀錄時完全不渲染。
export default function RecentlyViewedRail({ properties, currency }) {
  const [viewedItems, setViewedItems] = useState([]);

  useEffect(() => {
    const viewed = getRecentlyViewed();
    const byId = new Map(properties.map((p) => [p.id, p]));
    const matched = viewed
      .map((entry) => byId.get(entry.id))
      .filter(Boolean);
    setViewedItems(matched);
  }, [properties]);

  if (viewedItems.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-900">你看過的物件</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {viewedItems.map((item) => (
          <Link
            key={item.id}
            href={`/properties/${encodeURIComponent(item.id)}`}
            className="shrink-0 w-48 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="h-28 bg-slate-100">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.title}</p>
              <p className="text-xs font-black text-blue-600">{formatPropertyPrice(item.priceJPY, currency)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
