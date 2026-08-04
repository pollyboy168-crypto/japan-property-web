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
  // 🏠 精選與自營房源資料庫 (Shinsai Wings 開價 1.2 億日圓)
  // ----------------------------------------------------------------
  const properties = [
    {
      id: 'prop-shinsai-wings',
      title: '【和日直營/旗艦出售】心齋橋圈 5層獨棟特區民泊 (Shinsai Wings)',
      location: '大阪市中央區',
      structure: '5層獨棟 S造 (鋼骨構造)',
      priceJPY: 120000000, // 正式開價 1 億 2 千萬日圓
      description: '1樓配備專業消防與合規格柵改建，2-5樓精裝多人旅宿格局。擁有 365 天合法營運執照，附帶日本在地營運團隊無縫接軌。',
      tags: ['直營旗艦標的', '365天特區民泊', '格柵改建實績', '帶租約出售'],
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      isFlagship: true,
      externalUrl: companyInfo.flagshipUrl
    },
    {
      id: 'prop-2',
      title: '難波站徒步 6 分鐘 高人氣觀光獨棟套房',
      location: '大阪市浪速區',
      structure: 'RC 鋼筋混凝土構造',
      priceJPY: 38500000, // 已含加價
      description: '地段極佳，觀光客住房率極高。現成日本在地團隊無縫接軌代管，買下即可享受穩定外幣被動收入。',
      tags: ['難波商圈', 'RC結構', '高住房率'],
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      isFlagship: false
    },
    {
      id: 'prop-3',
      title: '此花區獨棟民宿 關西萬博與賭場受惠首選',
      location: '大阪市此花區',
      structure: '獨棟鋼構改建',
      priceJPY: 68000000, // 已含加價
      description: '鄰近環球影城與夢洲賭場萬博會場，大坪數多人家庭房型，極具資產增值與租金翻倍潛力。',
      tags: ['萬博概念區', '特區民泊', '大坪數家庭房'],
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
                {companyInfo.jpCompanyEn} ｜ 日本不動產與資產管理
              </span>
            </div>
          </div>

          {/* 中央選單連結 */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#calculator" className="hover:text-blue-600 transition">投資試算</a>
            <a href="#properties" className="hover:text-blue-600 transition">精選物件</a>
            <a href="#flagship" className="hover:text-blue-600 transition">民宿特輯 (Shinsai Wings)</a>
            <a href="#cases" className="hover:text-blue-600 transition">改建成功案例</a>
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
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-3 py-1 rounded-full font-medium">
            <span>🇯🇵</span> 日本在地合法法人 ‧ 大阪市中央區日本橋總部
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            日本大阪房產投資 ✕ 特區民泊改建<br />打造高回報資產與被動收入
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            由【株式会社和日】在地親自營運！提供從精準選址、1樓合規格柵改建、消防許可申請，到在地團隊代管接單與資產出售的一站式服務。
          </p>

          {/* 快捷切換按鈕 */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a href="#calculator" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">📊 收益試算</a>
            <a href="#flagship" className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-lg transition">👑 旗艦物業 1.2億日圓</a>
            <a href="#cases" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition">🛠️ 改建實績</a>
          </div>
        </div>
      </section>

      {/* 核心內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
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

        {/* 2. 民宿特輯：Shinsai Wings 旗艦物件深剖 (id="flagship") */}
        <section id="flagship" className="scroll-mt-20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="bg-amber-500 text-slate-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                👑 株式會社和日 直營旗艦物業
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
                由和佑工程團隊親自規劃，1 樓完成合規格柵工法與結構強化，2-5 樓完美保持旅宿格局，順利通過日本消防嚴格複驗。
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-2xl">📜</div>
              <h3 className="font-bold text-lg text-white">365 天特區民泊營業許可</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                擺脫一般民宿 180 天營運限制！擁有大阪特區民泊/旅館業完整許可，全年 365 天無間斷接單，收益最大化。
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-2xl">🤝</div>
              <h3 className="font-bold text-lg text-white">在地 Max 團隊無縫接管</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                附帶成熟營運軟硬體！由日本在地經理團隊 Max 負責清潔、現場房客對應與多平台接單，買下即刻接手穩定現金流。
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
            <p className="text-slate-500 text-sm mt-1">經株式会社和日團隊勘查，具備 1 樓格柵改建與 365 天民泊執照之優質物件</p>
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

        {/* 4. 改建成功案例 (id="cases") */}
        <section id="cases" className="scroll-mt-20 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Proven Track Record</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">一站式改建與營運成功案例</h2>
            <p className="text-slate-500 text-sm mt-1">我們如何幫舊獨棟物業注入高價值，變成高回報民泊資產？</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-bold text-sm">步驟 01 ‧ 精準選址與結構評估</div>
              <h3 className="font-bold text-slate-900">獨棟 S 造/鋼構大樓篩選</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                挑選位於心齋橋、難波等高觀光流量區域，且建物構造具備特區民泊申請資格的獨棟建築。
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-bold text-sm">步驟 02 ‧ 1樓格柵與消防審查</div>
              <h3 className="font-bold text-slate-900">工程改建與法規認證</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                進行 1 樓外觀格柵工程升級與內部消防設備安裝，順利通過大阪保健所與消防局合規檢查。
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-bold text-sm">步驟 03 ‧ 在地營運與帶租約 Exit</div>
              <h3 className="font-bold text-slate-900">託管接單與資產增值</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                由在地 Max 團隊對應國際觀光客，創造穩定高住房率後，掛牌帶租約出售給海外買家。
              </p>
            </div>
          </div>
        </section>

        {/* 5. 日本官方公司背景信任區 */}
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

        {/* 6. 專人諮詢 CTA */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">貼上您看中的日本房產網址</h2>
            <p className="text-slate-300 text-sm">
              在 SUUMO 或樂待看到喜歡的物件？直接將網址傳給我們！株式会社和日專業團隊將為您進行改建可行性、消防許可評估與投報率分析。
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