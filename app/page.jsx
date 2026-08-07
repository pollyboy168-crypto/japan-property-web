'use client';

import React, { useState, useEffect, useMemo } from 'react';
import YieldCalculator from '@/components/YieldCalculator';
import SiteHeader from '@/components/SiteHeader';
import HeroBanner from '@/components/HeroBanner';
import WhyOsaka from '@/components/WhyOsaka';
import FlagshipShowcase from '@/components/FlagshipShowcase';
import RenovationCaseStudy from '@/components/RenovationCaseStudy';
import FaqSection from '@/components/FaqSection';
import PropertyFilterBar from '@/components/PropertyFilterBar';
import PropertyGrid from '@/components/PropertyGrid';
import NewsRail from '@/components/NewsRail';
import ContactCta from '@/components/ContactCta';
import SellPropertyCta from '@/components/SellPropertyCta';
import GalleryModal from '@/components/GalleryModal';
import SiteFooter from '@/components/SiteFooter';
import LineFab from '@/components/LineFab';
import LeadFormModal from '@/components/LeadFormModal';
import RecentlyViewedRail from '@/components/RecentlyViewedRail';
import FavoritesCartWidget from '@/components/FavoritesCartWidget';
import { getAllProperties } from '@/lib/properties';
import { getLatestNews } from '@/lib/news';
import { getFavorites } from '@/lib/clientStorage';

const ITEMS_PER_BATCH = 12;

export default function Home() {
  const [currency, setCurrency] = useState('JPY');

  // ----------------------------------------------------------------
  // 🏠 動態物件資料庫與「載入更多」State
  // ----------------------------------------------------------------
  const [properties, setProperties] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);

  const [activeGallery, setActiveGallery] = useState(null);

  // ----------------------------------------------------------------
  // 🔍 搜尋／篩選 State
  // ----------------------------------------------------------------
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // ----------------------------------------------------------------
  // ❤ 收藏清單 State（localStorage，訪客個人紀錄，非登入帳號）。
  // 檢視收藏清單唯一入口是右下角浮動的 FavoritesCartWidget，物件牆本身
  // 不再提供「只看收藏」篩選開關。
  // ----------------------------------------------------------------
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    getAllProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
    getLatestNews(6).then(setNews);
    setFavorites(getFavorites());
  }, []);

  const handleFavoriteToggled = () => {
    setFavorites(getFavorites());
  };

  // ----------------------------------------------------------------
  // 🔍 篩選邏輯：關鍵字（標題/地點）、區域、總價上限
  // ----------------------------------------------------------------
  const filteredProperties = useMemo(() => {
    let list = properties;

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(kw) || item.location.toLowerCase().includes(kw));
    }

    if (region) {
      list = list.filter((item) => item.location.includes(region));
    }

    if (maxPrice) {
      list = list.filter((item) => item.priceJPY <= Number(maxPrice));
    }

    return list;
  }, [properties, keyword, region, maxPrice]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [keyword, region, maxPrice]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProperties.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_BATCH);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth">
      <SiteHeader propertiesCount={properties.length} currency={currency} setCurrency={setCurrency} />

      <HeroBanner />

      {/* 主內容區：客人進來先看房子，新聞區塊挪到房源之後 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <WhyOsaka />

        <FlagshipShowcase properties={properties} />

        {/* 投資報酬率試算器 */}
        <section id="calculator" className="scroll-mt-20">
          <YieldCalculator />
        </section>

        <RecentlyViewedRail properties={properties} currency={currency} />

        <div className="space-y-4">
          <PropertyFilterBar
            properties={properties}
            keyword={keyword}
            onKeywordChange={setKeyword}
            region={region}
            onRegionChange={setRegion}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            resultCount={filteredProperties.length}
          />

          <PropertyGrid
            propertiesCount={filteredProperties.length}
            visibleProperties={visibleProperties}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loading={loading}
            currency={currency}
            onViewGallery={setActiveGallery}
            onToggleFavorite={handleFavoriteToggled}
          />
        </div>

        <SellPropertyCta />

        <RenovationCaseStudy />

        <FaqSection />

        <NewsRail news={news} />

        <ContactCta />
      </main>

      <GalleryModal property={activeGallery} onClose={() => setActiveGallery(null)} />

      <SiteFooter />

      <LineFab />
      <LeadFormModal variant="fab" />
      <FavoritesCartWidget properties={properties} favorites={favorites} currency={currency} onFavoritesChanged={handleFavoriteToggled} />
    </div>
  );
}
