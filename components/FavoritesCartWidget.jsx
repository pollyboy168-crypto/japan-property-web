'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPropertyPrice } from '@/lib/constants';
import { toggleFavorite } from '@/lib/clientStorage';

// 收藏清單浮動按鈕：顯示收藏數量，點擊展開清單面板。
// 是全站唯一的收藏檢視入口（PropertyGrid 不再另外提供「只看收藏」切換鈕）。
export default function FavoritesCartWidget({ properties, favorites, currency, onFavoritesChanged }) {
  const [open, setOpen] = useState(false);

  const favoritedItems = properties.filter((item) => favorites.includes(item.id));

  if (favorites.length === 0) return null;

  const handleRemove = (id) => {
    toggleFavorite(id);
    onFavoritesChanged();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-44 right-5 z-40 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-lg flex items-center justify-center transition"
        aria-label="查看收藏清單"
      >
        <span className="text-2xl">❤️</span>
        <span className="absolute -top-1 -right-1 bg-white text-amber-600 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-amber-500">
          {favorites.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />

          <div className="relative bg-white w-full max-w-sm h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">❤️ 我的收藏 ({favoritedItems.length})</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {favoritedItems.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-16">還沒有收藏任何物件</p>
              ) : (
                favoritedItems.map((item) => (
                  <div key={item.id} className="p-4 flex gap-3">
                    <Link
                      href={`/properties/${encodeURIComponent(item.id)}`}
                      onClick={() => setOpen(false)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0"
                    >
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/properties/${encodeURIComponent(item.id)}`}
                        onClick={() => setOpen(false)}
                        className="text-xs font-semibold text-slate-900 line-clamp-2 hover:text-blue-600"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs font-black text-blue-600">{formatPropertyPrice(item.priceJPY, currency)}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-300 hover:text-amber-500 shrink-0"
                      aria-label="移除收藏"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {favoritedItems.length > 0 && (
              <div className="p-4 border-t border-slate-200">
                <Link
                  href="/#properties"
                  onClick={() => setOpen(false)}
                  className="block text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                  回到物件牆查看
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
