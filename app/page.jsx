'use client';

import React, { useState } from 'react';

export default function Home() {
  // 匯率與貨幣設定
  const [currency, setCurrency] = useState('JPY'); // 'JPY' | 'TWD'
  const jpyToTwd = 0.21;

  // ---------------------------------------------------------------- border
  // 📍 真實聯絡資料設定區 (可依需求替換為你的真實 LINE 連結與 Email)
  // ---------------------------------------------------------------- border
  const contactInfo = {
    companyName: '和佑‧和暘工程 / 日本資產管理',
    lineUrl: 'https://line.me/ti/p/~your_line_id', // ⚠️ 請替換為你的 LINE 官方帳號或個人 LINE 連結
    email: 'contact@her-yow.com',                  // ⚠️ 請替換為你的 Email
    phone: '+886-2-XXXX-XXXX',                     // ⚠️ 台灣或日本聯絡電話
    location: '台灣 / 日本大阪在地團隊 (Max 營運團隊)'
  };

  // ---------------------------------------------------------------- border
  // 🏠 房源資料庫 (可手動新增，或未來透過 n8n 自動填入)
  // ---------------------------------------------------------------- border
  const properties = [
    {
      id: 'prop-1',
      title: '心齋橋徒步圈 5層獨棟旅館預定地',
      location: '大阪市中央區',
      structure: '5層獨棟 S造 (鋼骨)',
      originalPriceJPY: 85000000,
      markupRate: 1.1, // 自動加價 10%
      description: '1樓可做合規格柵改建，2樓以上維持精緻格局，符合 365 天特區民泊營運規範。',
      tags: ['心齋橋圈', '365天執照適合', '格柵改建'],
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      sourceUrl: '' // 原始房源網址 (備查)
    },
    {
      id: 'prop-2',
      title: '難波站徒步 6 分鐘 高人氣觀光套房',
      location: '大阪市浪速區',
      structure: 'RC 鋼筋混凝土',
      originalPriceJPY: 32000000,
      markupRate: 1.1, // 自動加價 10%
      description: '交通極度優越，觀光客住房首選，現成日本在地團隊無縫接軌代管。',
      tags: ['難波商圈', 'RC結構', '高住房率'],
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      sourceUrl: ''
    },
    {
      id: 'prop-3',
      title: '此花區獨棟民宿 萬博直接受惠區',
      location: '大阪市此花區',
      structure: '獨棟木造/改裝鋼構',
      originalPriceJPY: 58000000,
      markupRate: 1.1, // 自動加價 10%
      description: '鄰近環球影城與夢洲賭場萬博會場，大坪數家庭房型首選。',
      tags: ['萬博概念區', '特區民泊', '大坪數'],
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      sourceUrl: ''
    }
  ];

  // 投資試算計算機 State
  const [propertyPriceJPY, setPropertyPriceJPY] = useState(8500);
  const [dailyRateJPY, setDailyRateJPY] = useState(18000);
  const [occupancyRate, setOccupancyRate] = useState(70);
  const [mgmtFeeRate, setMgmtFeeRate] = useState(20);

  // 試算邏輯
  const priceInJPY = propertyPriceJPY * 10000;
  const bookedDays = Math.round(365 * (occupancyRate / 100));
  const grossRevenueJPY = bookedDays * dailyRateJPY;
  const mgmtExpenseJPY = grossRevenueJPY * (mgmtFeeRate / 100);
  const netRevenueJPY = grossRevenueJPY - mgmtExpenseJPY - 500000;
  const grossYield = ((grossRevenueJPY / priceInJPY) * 100).toFixed(2);
  const netYield = Math.max(0, (netRevenueJPY / priceInJPY) * 100).toFixed(2);

  // 價格顯示 (自動計算 10% 加價後金額)
  const formatPropertyPrice = (originalJPY, markup = 1.1) => {
    const finalJPY = originalJPY * markup;
    if (currency === 'TWD') {
      const twd = Math.round(finalJPY * jpyToTwd);
      return `NT$ ${(twd / 10000).toFixed(0)} 萬`;
    }
    return `¥ ${(finalJPY / 10000).toLocaleString()} 萬日圓`;
  };

  const formatMoney = (amountJPY) => {
    if (currency === 'TWD') {
      return `NT$ ${Math.round(amountJPY * jpyToTwd).toLocaleString()}`;
    }
    return `¥ ${Math.round(amountJPY).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 導覽列 Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏯</span>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
              {contactInfo.companyName}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 幣別切換 */}
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

            {/* LINE 真實按鈕 */}
            <a
              href={contactInfo.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>💬</span> LINE 線上諮詢
            </a>
          </div>
        </div>
      </header>

      {/* 主標題 Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-3 py-1 rounded-full font-medium">
            365天特區民泊 ‧ 獨棟鋼構改建 ‧ 在地團隊一站式託管
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            大阪關西萬博日本房產置產<br />打造高收益被動收入
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            由台灣專業工程團隊配合日本在地經理，提供從選址、格柵與消防工程改建，到執照申請與代管運營的全方位服務。
          </p>
        </div>
      </section>

      {/* 核心內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* 1. 投報率計算機 */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold">📊 日本民宿投資收益模擬試算器</h2>
            <span className="text-xs text-slate-400">實時試算</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <label>預計物業總價：</label>
                  <span className="text-blue-600 font-bold">{propertyPriceJPY.toLocaleString()} 萬日圓 ({formatMoney(priceInJPY)})</span>
                </div>
                <input type="range" min="3000" max="30000" step="500" value={propertyPriceJPY} onChange={(e) => setPropertyPriceJPY(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <label>預估平均每日房價 (ADR)：</label>
                  <span className="text-blue-600 font-bold">{formatMoney(dailyRateJPY)} / 晚</span>
                </div>
                <input type="range" min="8000" max="60000" step="1000" value={dailyRateJPY} onChange={(e) => setDailyRateJPY(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <label>預估全年住房率：</label>
                  <span className="text-blue-600 font-bold">{occupancyRate}% ({bookedDays} 天/年)</span>
                </div>
                <input type="range" min="40" max="95" step="5" value={occupancyRate} onChange={(e) => setOccupancyRate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600" />
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">預估投資收益</h3>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span>預估年總營收：</span>
                  <span className="font-bold">{formatMoney(grossRevenueJPY)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span>預估淨年收益 (Net)：</span>
                  <span className="font-extrabold text-emerald-600">{formatMoney(netRevenueJPY)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 bg-white p-3 rounded-lg border text-center">
                <div>
                  <div className="text-xs text-slate-400">表面回報率</div>
                  <div className="text-xl font-black text-blue-600">{grossYield}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">實質回報率</div>
                  <div className="text-xl font-black text-emerald-600">{netYield}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 精選房源展示 (價格已帶入 1.1 倍加價邏輯) */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">熱門精選投資物件</h2>
            <p className="text-slate-500 text-sm mt-1">經團隊現場勘查，具備改裝格柵與取得 365 天民泊執照潛力之物件</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                <div className="relative h-48 bg-slate-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-blue-600 font-semibold">{item.location} ‧ {item.structure}</span>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 block">預估刊登售價</span>
                      <span className="font-black text-blue-600 text-lg">
                        {formatPropertyPrice(item.originalPriceJPY, item.markupRate)}
                      </span>
                    </div>
                    <a
                      href={contactInfo.lineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                    >
                      索取資料
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 專人諮詢 Call To Action */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">想看更多物件或評估自選房源？</h2>
            <p className="text-slate-300 text-sm">
              如果您在日本房產網站（如 SUUMO、樂待）看到心儀物件，歡迎直接傳送網址給我們！我們的工程與在地團隊將為您評估合規性與改裝收益。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href={contactInfo.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <span>💬</span> 透過 LINE 傳送房源網址
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              <span>✉️</span> Email 諮詢 ({contactInfo.email})
            </a>
          </div>
        </section>
      </main>

      {/* 頁尾 Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">{contactInfo.companyName} | {contactInfo.location}</p>
          <p>© 2026 Japan Property Web. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}