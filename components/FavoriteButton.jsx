'use client';

import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/clientStorage';
import { trackEvent } from '@/lib/analytics';

// 獨立管理自己的收藏狀態（讀寫 localStorage），不依賴外部 state，
// 可以直接掛在物件卡或詳情頁任何地方使用。
export default function FavoriteButton({ propertyId, className = '', onToggle }) {
  const [favorited, setFavorited] = useState(false);

  // 初始渲染在伺服器端沒有 localStorage，掛載後才讀取實際狀態，避免 hydration 不一致
  useEffect(() => {
    setFavorited(isFavorite(propertyId));
  }, [propertyId]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(propertyId);
    const next = !favorited;
    setFavorited(next);
    // 選擇性通知外層（例如首頁的「只看收藏」清單需要知道有東西變動了）
    onToggle?.(propertyId, next);
    trackEvent('favorite_toggle', { property_id: propertyId, favorited: next });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? '取消收藏此物件' : '收藏此物件'}
      aria-pressed={favorited}
      className={`flex items-center justify-center transition ${favorited ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'} ${className}`}
    >
      {favorited ? '❤️' : '🤍'}
    </button>
  );
}
