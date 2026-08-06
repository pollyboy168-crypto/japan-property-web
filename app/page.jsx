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
import { getAllProperties } from '@/lib/properties';

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

  useEffect(() => {
    getAllProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  // ----------------------------------------------------------------
  // 📄 分頁計算邏輯 (無跳動極速切換)
  // ----------------------------------------------------------------
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = properties.slice(indexOfFirstItem, indexOfLastItem);

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

        <PropertyGrid
          propertiesCount={properties.length}
          currentProperties={currentProperties}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          currency={currency}
          onViewGallery={setActiveGallery}
        />

        <ContactCta />
      </main>

      <GalleryModal property={activeGallery} onClose={() => setActiveGallery(null)} />

      <SiteFooter />

      <LineFab />
    </div>
  );
}
