'use client';

import { useEffect } from 'react';
import { recordView } from '@/lib/clientStorage';

// 不渲染任何畫面，掛載時把這筆物件記進訪客自己的瀏覽紀錄（localStorage）。
export default function TrackPropertyView({ propertyId }) {
  useEffect(() => {
    recordView(propertyId);
  }, [propertyId]);

  return null;
}
