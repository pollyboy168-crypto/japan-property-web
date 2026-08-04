'use client';

import React, { useState } from 'react';

export default function Home() {
  // 匯率與貨幣設定 (以 1 JPY = 0.21 TWD 估算)
  const [currency, setCurrency] = useState('JPY'); // 'JPY' | 'TWD'
  const jpyToTwd = 0.21;

  // ----------------------------------------------------------------
  // 🏢 日本法人與真實聯絡資訊設定區
  // ----------------------------------------------------------------
  const companyInfo = {
    jpCompanyName: '株式会社和日',
    jpCompanyEn: 'Kazuhi Co., Ltd.',
    address: '大阪府大阪市中央区日本橋二丁目8-15',
    licenseNo: '法人番号 1200-01-288148',
    lineUrl: 'https://line.me/ti/p/~your_line_id', // ⚠️ 請替換為您的 LINE 連結
    email: 'contact@kazuhi-property.com',         // ⚠️ 請替換為您的 Email
    flagshipUrl: 'https://www.shinsai-wings-osakastay.com/' // 旗艦民宿網址
  };

  // ----------------------------------------------------------------
  // 🏠 精選與自營房源資料庫
  // ----------------------------------------------------------------
  const properties = [
    {
      id: 'prop-shinsai-wings',
      title: '【和日直營/旗艦出售】心齋橋圈 5層獨棟特區民泊 (Shinsai Wings)',
      location: '大阪市中央區',
      structure: '5層獨棟 S造 (鋼骨構造)',
      priceJPY: 120000000, // 1 億 2 千萬日圓
      description: '1樓配備專業消防與合規格柵改建，2-5樓精裝多人旅宿格局。永久產權獨棟大樓，擁 365 天合法特區民泊執照，帶現成滿房營運團隊。',
      tags: ['直營旗艦標的', '永久產權', '365天特區民泊', '賭場圈捷運線'],
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      isFlagship: true,
      externalUrl: companyInfo.flagshipUrl
    },
    {
      id: 'prop-2',
      title: '難波站徒步 6 分鐘 高人氣觀光獨棟套房',
      location: '大阪市浪速區',
      structure: 'RC 鋼筋混凝土構造',
      priceJPY: 38500000,
      description: '價格僅台灣小兩房的三分之一！地段極佳，賭場直達地鐵線周邊，觀光客住房率極高。現成團隊代管，買下即可享受穩定外幣被動收入。',
      tags: ['難波商圈', '親民總價', 'RC永久產權'],
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      isFlagship: false
    },
    {
      id: 'prop-3',
      title: '此花區獨棟民宿 夢洲賭場與萬博第一線受惠區',
      location: '大阪市此花區',
      structure: '獨棟鋼構改建',
      priceJPY: 68000000,
      description: '直達賭場預定地夢洲！鄰近環球影城，大坪數家庭房型，博弈綜合度假村（IR）開幕後預計租金與地價呈爆發性成長。',
      tags: ['賭場概念第一線', '特區民泊', '大坪數家庭房'],
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      isFlagship: false
    }
  ];

  // 試算器 State
  const [propertyPriceJPY, setPropertyPriceJPY] = useState(12000); // 預設 1.2 億
  const [dailyRateJPY, setDailyRateJPY] = useState(25000);
  const [occupancyRate, setOccupancyRate] = useState(80);
  const [mgmtFeeRate, setMgmtFeeRate] = useState(20);

  // 財務試算邏輯
  const priceInJPY = propertyPriceJPY * 10000;
  const bookedDays = Math.round(365 * (occupancyRate / 100));
  const grossRevenueJPY = bookedDays * dailyRateJPY;
  const mgmtExpenseJPY = grossRevenueJPY * (mgmtFeeRate / 100);
  const netRevenueJPY = grossRevenueJPY - mgmtExpenseJPY - 600000;
  const grossYield = ((grossRevenueJPY / priceInJPY) * 100).toFixed(2);
  const netYield = Math.max(0, (netRevenueJPY / priceInJPY) * 100).toFixed(2);

  // 格式化顯示
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
      {/* 頂部導覽列 Header */}
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

          {/* 中央選單連結 */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#why-osaka" className="hover:text-blue-600 transition">大阪核心吸引力</a>
            <a href="#calculator" className="hover:text-blue-600 transition">投資試算</a>
            <a href="#flagship" className="hover:text-blue-600 transition">旗艦民宿 (Shinsai Wings)</a>
            <a href="#properties" className="hover:text-blue-600 transition">精選物件</a>
          </nav>
          
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

            {/* LINE 官方按鈕 */}
            <a
              href={companyInfo.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>💬</span> LINE 諮詢
            </a>
          </div>
        </div>
      </header>

      {/* 主標題 Banner */}
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

          {/* 快捷切換按鈕 */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a href="#why-osaka" className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-lg transition">🎰 大阪四大投資吸引力</a>
            <a href="#calculator" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">📊 收益試算</a>
            <a href="#flagship" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition">👑 旗艦獨棟物業</a>
          </div>
        </div>
      </section>

      {/* 核心內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 🔥🔥 核心亮點專區：為什麼投資大阪房產？四大致命吸引力 (id="why-osaka") */}
        <section id="why-osaka" className="scroll-mt-20 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Core Investment Value</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">為什麼現在是佈局大阪房產的最佳時機？</h2>
            <p className="text-slate-500 text-sm">結合國家級重大建設與極致高CP值，兼具投資獲利與自住傳承價值</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. 夢洲賭場紅利 */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
              <div className="text-amber-400 text-3xl font-black">01</div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>🎰</span> 2030 大阪夢洲 IR 綜合度假村 (賭場)
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                日本首座合法博弈綜合度假村（IR）確定落腳大阪夢洲！預計每年帶來數千億日圓觀光經濟效益與千萬國際賭客，鄰近捷運線房價與民泊住房率將迎來黃金十年暴增期。
              </p>
            </div>

            {/* 2. 土地永久產權 */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="text-blue-600 text-3xl font-black">02</div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏯</span> 土地永久產權 (世襲代代相傳)
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                買日本房子等於連同「土地」一併永久買下！不同於部分國家的地上權或租賃權，日本地產為世襲制永久產權，無使用年限，能作為代代相傳的家族堅實資產。
              </p>
            </div>

            {/* 3. 價格比台灣親民 */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="text-emerald-600 text-3xl font-black">03</div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>💰</span> 房價比台灣親民，基期低回報高
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                台北新北一套老公寓的價格，在大阪市中心（心齋橋/難波）就能買下整棟鋼構大樓或透天厝！低房價門檻配上 $6\% - 10\%$ 的高淨回報，性價比遠勝台港與東南亞。
              </p>
            </div>

            {/* 4. 特區民泊 365 天營運 */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="text-indigo-600 text-3xl font-black">04</div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📅</span> 大阪特區民泊 365 天全年營運
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                大阪擁有日本少有的「特區民泊」法規優勢，突破一般民宿 180 天的限制！配合株式会社和日在地改建與代管，讓您的資產一年 365 天無間斷產生日圓現金流。
              </p>
            </div>
          </div>
        </section>

        {/* 1. 投報率計算機 (id="calculator") */}
        <section id="calculator" className="scroll-mt-20 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>📊</span> 日本民宿投資收益模擬試算器 (ROI Calculator)
            </h2>
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
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">預估投資收益分析</h3>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span>預估年總營收：</span>
                  <span className="font-bold">{formatMoney(grossRevenueJPY)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span>預估淨年收益 (Net Revenue)：</span>
                  <span className="font-extrabold text-emerald-600">{formatMoney(netRevenueJPY)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 bg-white p-3 rounded-lg border text-center">
                <div>
                  <div className="text-xs text-slate-400">表面回報率 (Gross)</div>
                  <div className="text-xl font-black text-blue-600">{grossYield}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">實質回報率 (Net)</div>
                  <div className="text-xl font-black text-emerald-600">{netYield}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 民宿特輯：Shinsai Wings 旗艦物件 (id="flagship") */}
        <section id="flagship" className="scroll-mt-20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="bg-amber-500 text-slate-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                👑 株式會社和日 直營旗艦物業 (永久產權)
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-3">心齋橋圈 5層獨棟特區民泊 (Shinsai Wings)</h2>
              <p className="text-slate-400 text-sm mt-1">完美改建示範標的 ‧ 帶 365 天執照與現成營運團隊出售</p>
            </div>
            <div className="text-right bg-slate-800/90 p-4 rounded-2xl border border-amber-500/40">
              <span className="text-xs text-slate-400 block font-medium">獨家售價 (Exit Price)</span>
              <span className="text-3xl font-black text-amber-400">{formatPropertyPrice(120000000)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-2xl">🏗️</div>
              <h3 className="font-bold text-lg text-white">1 樓專業格柵與消防工程</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                1 樓完成合規格柵工法與結構強化，2-5 樓完美保持旅宿格局，順利通過大阪消防與保健所嚴格複驗。
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-2xl">🎰</div>
              <h3 className="font-bold text-lg text-white">心齋橋圈 ‧ 賭場捷運線連通</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                坐落於大阪黃金核心心齋橋商圈，地鐵直達 2030 夢洲賭場與萬博會場，地價增值與高住房率雙重保障。
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-2xl">🤝</div>
              <h3 className="font-bold text-lg text-white">在地 Max 團隊無縫接管</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                由日本在地經理團隊 Max 負責清潔、現場房客對應與多平台接單，買下即刻接手穩定被動現金流。
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-300">
              💡 歡迎預約現場/線上看房，或點擊連結查看房客預訂實況與評價。
            </div>
            <a
              href={companyInfo.flagshipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg"
            >
              🌐 前往 Shinsai Wings 房客預訂官網 ➔
            </a>
          </div>
        </section>

        {/* 3. 精選房源展示 (id="properties") */}
        <section id="properties" className="scroll-mt-20 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">精選與直營投資物件</h2>
            <p className="text-slate-500 text-sm mt-1">經株式会社和日團隊勘查，具備 1 樓格柵改建與 365 天民泊執照之永久產權物件</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm border ${item.isFlagship ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'} overflow-hidden hover:shadow-md transition flex flex-col justify-between`}>
                <div className="relative h-48 bg-slate-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm ${item.isFlagship && idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-900/80 text-white'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs text-blue-600 font-semibold">{item.location} ‧ {item.structure}</span>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-slate-400 block">預售價格 (含代管)</span>
                        <span className="font-black text-blue-600 text-lg">
                          {formatPropertyPrice(item.priceJPY)}
                        </span>
                      </div>
                      <a
                        href={companyInfo.lineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                      >
                        預約看房/索取資料
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 日本官方公司背景信任區 */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Official Legal Entity</span>
              <h2 className="text-2xl font-bold mt-1">日本在地合法登記法人證明</h2>
            </div>
            <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg">
              {companyInfo.licenseNo}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-white text-base">商號與本店所在地</div>
              <p>• 法人名稱：株式会社和日 (Kazuhi Co., Ltd.)</p>
              <p>• 本店地址：{companyInfo.address}</p>
              <p>• 登記地：日本大阪法務局管轄</p>
            </div>
            <div className="space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-white text-base">合法營業登記項目</div>
              <p>1. 不動產投資、買賣、租賃、管理與仲介</p>
              <p>2. 建築與裝修改修工程 (1樓格柵改建)</p>
              <p>3. 飯店、旅館與民泊 (民宿) 之經營管理</p>
            </div>
          </div>
        </section>

        {/* 5. 專人諮詢 CTA */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">卡位大阪賭場黃金十年 ‧ 預約專人諮詢</h2>
            <p className="text-slate-300 text-sm">
              在 SUUMO、樂待或日本仲介看到喜歡的物件？直接將網址傳給我們！株式会社和日專業團隊將為您評估改建可行性、賭場線優勢與真實投報率。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href={companyInfo.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <span>💬</span> 透過 LINE 傳送房源網址評估
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              <span>✉️</span> Email 諮詢 ({companyInfo.email})
            </a>
          </div>
        </section>
      </main>

      {/* 頁尾 Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">{companyInfo.jpCompanyName} ({companyInfo.jpCompanyEn}) ｜ {companyInfo.address}</p>
          <p>© 2026 株式会社和日. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}