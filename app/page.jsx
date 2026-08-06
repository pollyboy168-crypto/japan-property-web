'use client';

import React, { useState, useEffect } from 'react';
import YieldCalculator from '@/components/YieldCalculator';
import SiteHeader from '@/components/SiteHeader';
import HeroBanner from '@/components/HeroBanner';
import WhyOsaka from '@/components/WhyOsaka';
import PropertyGrid from '@/components/PropertyGrid';
import ContactCta from '@/components/ContactCta';
import GalleryModal from '@/components/GalleryModal';
import SiteFooter from '@/components/SiteFooter';
import LineFab from '@/components/LineFab';
import RecentlyViewedRail from '@/components/RecentlyViewedRail';
import { getAllProperties } from '@/lib/properties';
import { getFavorites } from '@/lib/clientStorage';

export default function Home() {
  const [currency, setCurrency] = useState('JPY');

  // ----------------------------------------------------------------
  // 🏠 動態物件資料庫與分頁 State
  // ----------------------------------------------------------------
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [activeGallery, setActiveGallery] = useState(null);

  // ----------------------------------------------------------------
  // ❤ 收藏清單 State（localStorage，訪客個人紀錄，非登入帳號）
  // ----------------------------------------------------------------
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    getAllProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
    setFavorites(getFavorites());
  }, []);

  const handleFavoriteToggled = () => {
    setFavorites(getFavorites());
  };

  const handleToggleFavoritesOnly = () => {
    setShowFavoritesOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // ----------------------------------------------------------------
  // 📄 分頁計算邏輯 (無跳動極速切換)
  // ----------------------------------------------------------------
  const visibleProperties = showFavoritesOnly
    ? properties.filter((item) => favorites.includes(item.id))
    : properties;

  const totalPages = Math.ceil(visibleProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = visibleProperties.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // 不再整頁滾動，流暢原地切換
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth">
      <SiteHeader propertiesCount={properties.length} currency={currency} setCurrency={setCurrency} />

      <HeroBanner />

      {/* 主內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <WhyOsaka />

        {/* 投資報酬率試算器 */}
        <section id="calculator" className="scroll-mt-20">
          <YieldCalculator />
        </section>

        <RecentlyViewedRail properties={properties} currency={currency} />

        <PropertyGrid
          propertiesCount={visibleProperties.length}
          currentProperties={currentProperties}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          currency={currency}
          onViewGallery={setActiveGallery}
          onToggleFavorite={handleFavoriteToggled}
          favoritesCount={favorites.length}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={handleToggleFavoritesOnly}
        />

        <ContactCta />
      </main>

      <GalleryModal property={activeGallery} onClose={() => setActiveGallery(null)} />

      <SiteFooter />

      <LineFab />
    </div>
  );
}
