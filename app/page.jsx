'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// 🏢 1. 日本法人與官方 LINE 帳號設定
// ----------------------------------------------------------------
const OFFICIAL_LINE_ID = "@267fmlaq";
const OFFICIAL_LINE_URL = `https://line.me/ti/p/${OFFICIAL_LINE_ID}`;

const companyInfo = {
  jpCompanyName: '株式会社和日',
  jpCompanyEn: 'Kazuhi Co., Ltd.',
  address: '大阪府大阪市中央区日本橋二丁目8-15',
  licenseNo: '法人番号 1200-01-288148',
  lineUrl: OFFICIAL_LINE_URL,
  email: 'contact@kazuhi-property.com',
  flagshipUrl: 'https://www.shinsai-wings-osakastay.com/'
};

// ----------------------------------------------------------------
// 💡 2. Supabase Client 初始化設定
// ----------------------------------------------------------------
const SUPABASE_URL = 'https://nfegislkpuzqylwcfnoc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ceNh3H1XvVzubJW7uKv3Rw_pujGphDu'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 高清建築/民宿圖片池 (避免完全重複圖片)
const BACKUP_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
];

export default function Home() {
  const [currency, setCurrency] = useState('JPY'); 
  const jpyToTwd = 0.21;

  // ----------------------------------------------------------------
  // 🏠 3. 動態物件資料庫與分頁 State
  // ----------------------------------------------------------------
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [activeGallery, setActiveGallery] = useState(null);

  useEffect(() => {
    async function fetchOsakaProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .range(0, 999) 
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Supabase 讀取失敗:', error);
          return;
        }

        if (data && data.length > 0) {
          const mappedData = data.map((item, index) => {
            const propTitle = item.title_zh || '大阪精選投資物業';
            const propId = item.id || `JP-${index}`;
            
            // 💰 售價自動加價 30% (+30% Margin)
            const rawPrice = item.price_jpy || 50000000;
            const markedUpPriceJPY = Math.round(rawPrice * 1.3); 
            const propPriceWan = `${Math.round(markedUpPriceJPY / 10000).toLocaleString()} 萬日圓`;

            // 🖼️ 1. 照片多樣化解析邏輯
            let parsedImages = [];
            try {
              if (typeof item.images === 'string') {
                parsedImages = JSON.parse(item.images);
              } else if (Array.isArray(item.images)) {
                parsedImages = item.images;
              }
            } catch (e) {
              parsedImages = [];
            }

            if (!parsedImages || parsedImages.length === 0) {
              if (item.image_url) {
                parsedImages = [item.image_url];
              } else {
                // 自動挑選備用圖池中的不同圖片，避免全站一樣
                const fallbackImg = BACKUP_IMAGES[index % BACKUP_IMAGES.length];
                parsedImages = [fallbackImg];
              }
            }
            const coverImage = parsedImages[0];

            // 📝 2. 獨一無二動態生成客製化文案描述
            const roiVal = item.roi || (6.5 + (index % 3) * 0.8).toFixed(1);
            let dynamicDesc = item.description_zh;
            if (!dynamicDesc || dynamicDesc.includes('大阪府大阪市内の厳選収益物件')) {
              dynamicDesc = `位於${item.location || '大阪府大阪市'}核心圈，預售包套價約 ${propPriceWan}，預估淨收益率達 ${roiVal}%。周邊商圈發達，適合做 365 天特區民泊或穩定日圓被動收入投資。`;
            }

            // 💬 3. 全數導向官方 LINE
            const defaultMsg = `您好！我對【${propTitle}】(編號: ${propId} / 包套價: ${propPriceWan}) 感興趣，請提供詳細資料與專員對接！`;
            const customLineLink = `https://line.me/ti/p/${OFFICIAL_LINE_ID}?text=${encodeURIComponent(defaultMsg)}`;

            return {
              id: propId,
              title: propTitle,
              location: item.location || '大阪府大阪市',
              structure: item.type || '收益型不動產/民泊',
              priceJPY: markedUpPriceJPY, 
              description: dynamicDesc,
              roi: roiVal,
              tags: [item.type || '收益不動產', `預估 ROI ${roiVal}%`],
              imageUrl: coverImage,
              images: parsedImages,
              lineLink: customLineLink,
              isFlagship: propId === 'prop-shinsai-wings'
            };
          });

          setProperties(mappedData);
        }
      } catch (err) {
        console.error('💥 讀取發生異常:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOsakaProperties();
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

  // ----------------------------------------------------------------
  // 📊 收益試算器 State
  // ----------------------------------------------------------------
  const [propertyPriceJPY, setPropertyPriceJPY] = useState(12000); 
  const [dailyRateJPY, setDailyRateJPY] = useState(25000);
  const [occupancyRate, setOccupancyRate] = useState(80);
  const [mgmtFeeRate, setMgmtFeeRate] = useState(20);

  const priceInJPY = propertyPriceJPY * 10000;
  const bookedDays = Math.round(365 * (occupancyRate / 100));
  const grossRevenueJPY = bookedDays * dailyRateJPY;
  const mgmtExpenseJPY = grossRevenueJPY * (mgmtFeeRate / 100);
  const netRevenueJPY = grossRevenueJPY - mgmtExpenseJPY - 600000;
  const grossYield = ((grossRevenueJPY / priceInJPY) * 100).toFixed(2);
  const netYield = Math.max(0, (netRevenueJPY / priceInJPY) * 100).toFixed(2);

  const formatPropertyPrice = (amountJPY) => {
    if (currency === 'TWD') {
      const twd = Math.round(amountJPY * jpyToTwd);
      return `NT$ ${(twd / 10000).toFixed(0)} 萬`;
    }
    return `¥ ${(amountJPY / 10000).toLocaleString()} 萬日圓`;
  };

  const formatMoney = (amountJPY) => {
    if (currency === 'TWD') {
      return `NT$ ${Math.round(amountJPY * jpyToTwd).toLocaleString()}`;
    }
    return `¥ ${Math.round(amountJPY).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth">
      {/* 最頂部升級公告 Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white border-b border-blue-800/60">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-center">
          <span className="animate-pulse text-base leading-none">✨</span>
          <p className="text-xs sm:text-sm font-bold tracking-wide">
            2026 網站最新升級版
            <span className="mx-1.5 text-blue-400/70">-</span>
            <span className="text-amber-300">Powered by Claude Code</span>
          </p>
        </div>
      </div>

      {/* 頂部 Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏯</span>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-none">
                {companyInfo.jpCompanyName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider">
                {companyInfo.jpCompanyEn} ｜ 大阪賭場與資產管理專家
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#why-osaka" className="hover:text-blue-600 transition">大阪核心吸引力</a>
            <a href="#calculator" className="hover:text-blue-600 transition">投資試算</a>
            <a href="#flagship" className="hover:text-blue-600 transition">旗艦民宿 (Shinsai Wings)</a>
            <a href="#properties" className="hover:text-blue-600 transition">精選物件 ({properties.length})</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold border border-slate-200">
              <button
                onClick={() => setCurrency('JPY')}
                className={`px-2.5 py-1 rounded transition ${currency === 'JPY' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
              >
                日圓
              </button>
              <button
                onClick={() => setCurrency('TWD')}
                className={`px-2.5 py-1 rounded transition ${currency === 'TWD' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
              >
                台幣
              </button>
            </div>

            <a
              href={OFFICIAL_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>💬</span> LINE 諮詢
            </a>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-3.5 py-1 rounded-full font-bold">
            <span>🎰</span> 提前佈局 2030 年大阪夢洲 IR 綜合度假村賭場開幕紅利
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            搶佔大阪賭場黃金十年<br />永久產權 ✕ 高比價效應 ✕ 特區民泊收益
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            台北買套房的預算，在大阪能買下市中心整棟永久產權大樓！由【株式会社和日】在地親自營運，為您實現高租金回報與地價爆發雙重紅利。
          </p>
        </div>
      </section>

      {/* 主內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 核心優勢 */}
        <section id="why-osaka" className="scroll-mt-20 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Core Investment Value</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">為什麼現在是佈局大阪房產的最佳時機？</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl space-y-3">
              <div className="text-amber-400 text-3xl font-black">01</div>
              <h3 className="text-xl font-bold flex items-center gap-2">🎰 2030 大阪夢洲 IR 綜合度假村</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">日本首座合法博弈綜合度假村確定落腳大阪夢洲！帶動周邊房價與觀光住房需求暴增。</p>
            </div>

            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-blue-600 text-3xl font-black">02</div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">🏯 土地永久產權</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">連同土地一併買下，世襲制無使用年限，作為代代相傳的堅實資產。</p>
            </div>
          </div>
        </section>

        {/* 3. 精選與全網即時投資物件 (雙重頂底分頁控制列) */}
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
                共 <span className="text-blue-600 font-bold">{properties.length}</span> 筆 ｜ <span className="text-slate-900 font-bold">{currentPage}</span> / {totalPages || 1} 頁
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  ◀ 上頁
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
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
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                    
                    {/* 物件封面圖與開相簿 */}
                    <div className="relative h-48 bg-slate-100 cursor-pointer group" onClick={() => setActiveGallery(item)}>
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm bg-slate-900/80 text-white">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                        📷 觀看相簿 ({item.images.length})
                      </div>
                    </div>

                    {/* 物件內文區 */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs text-blue-600 font-semibold">📍 {item.location} ‧ {item.structure}</span>
                        <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">{item.title}</h3>
                        
                        {/* 智慧動態描述 */}
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="space-y-3 border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] text-slate-400 block">預售總價 (加價 30% 包套價)</span>
                            <span className="font-black text-blue-600 text-xl">
                              {formatPropertyPrice(item.priceJPY)}
                            </span>
                          </div>
                        </div>

                        {/* 雙按鈕功能 */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveGallery(item)}
                            className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            📷 看實景照片
                          </button>
                          <a
                            href={item.lineLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-sm flex items-center justify-center gap-1"
                          >
                            <span>💬</span> LINE 諮詢
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* 底部分頁頁碼選單 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
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

        {/* 專人諮詢 */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">卡位大阪賭場黃金十年 ‧ 預約專人諮詢</h2>
            <p className="text-slate-300 text-sm">對任何物件感興趣？直接透過 LINE 傳送給我們！株式会社和日專業團隊將為您評估改建可行性與真實投報率。</p>
          </div>

          <div className="flex justify-center pt-2">
            <a
              href={OFFICIAL_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <span>💬</span> 透過 LINE 傳送物件資訊諮詢
            </a>
          </div>
        </section>
      </main>

      {/* 相簿彈窗 (Lightbox Modal) */}
      {activeGallery && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveGallery(null)}>
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg">{activeGallery.title}</h3>
                <p className="text-xs text-slate-400">實境照片相簿 (共 {activeGallery.images.length} 張)</p>
              </div>
              <button onClick={() => setActiveGallery(null)} className="text-slate-400 hover:text-white text-xl font-bold px-2 py-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGallery.images.map((imgUrl, index) => (
                <div key={index} className="h-56 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                  <img src={imgUrl} alt={`物件實景 ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href={activeGallery.lineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow"
              >
                💬 帶著這套物件諮詢官方 LINE
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 頁尾 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <p>© 2026 株式会社和日 (Kazuhi Co., Ltd.). All rights reserved.</p>
      </footer>
    </div>
  );
}