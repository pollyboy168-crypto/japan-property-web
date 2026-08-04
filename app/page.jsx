'use client';

import React, { useState } from 'react';

export default function Home() {
  // 匯率與貨幣設定 (以 1 JPY = 0.21 TWD 估算)
  const [currency, setCurrency] = useState('JPY'); // 'JPY' | 'TWD'
  const jpyToTwd = 0.21;

  // 投資試算計算機 State
  const [propertyPriceJPY, setPropertyPriceJPY] = useState(8500); // 單位：萬日圓
  const [dailyRateJPY, setDailyRateJPY] = useState(18000); // 每日房價 (日圓)
  const [occupancyRate, setOccupancyRate] = useState(70); // 預估住房率 (%)
  const [mgmtFeeRate, setMgmtFeeRate] = useState(20); // 代管營運費 (%)

  // 財務計算邏輯
  const priceInJPY = propertyPriceJPY * 10000;
  const priceInTWD = priceInJPY * jpyToTwd;

  const monthlyDays = 30;
  const annualDays = 365;
  const bookedDays = Math.round(annualDays * (occupancyRate / 100));

  const grossAnnualRevenueJPY = bookedDays * dailyRateJPY;
  const mgmtExpenseJPY = grossAnnualRevenueJPY * (mgmtFeeRate / 100);
  const fixedCostJPY = 500000; // 估算每年固定稅費與水電固雜費
  const netAnnualRevenueJPY = grossAnnualRevenueJPY - mgmtExpenseJPY - fixedCostJPY;

  const grossYield = ((grossAnnualRevenueJPY / priceInJPY) * 100).toFixed(2);
  const netYield = Math.max(0, (netAnnualRevenueJPY / priceInJPY) * 100).toFixed(2);

  // 貨幣格式化顯示 helper
  const formatMoney = (amountJPY) => {
    if (currency === 'TWD') {
      const twd = Math.round(amountJPY * jpyToTwd);
      return `NT$ ${twd.toLocaleString()}`;
    }
    return `¥ ${Math.round(amountJPY).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 導覽列 Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏯</span>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              日本房產與民宿投資專家 <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Osaka Special</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* 幣別切換按鈕 */}
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200 text-sm">
              <button
                onClick={() => setCurrency('JPY')}
                className={`px-3 py-1 rounded-md font-medium transition ${currency === 'JPY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                日圓 (JPY)
              </button>
              <button
                onClick={() => setCurrency('TWD')}
                className={`px-3 py-1 rounded-md font-medium transition ${currency === 'TWD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                台幣 (TWD)
              </button>
            </div>
            <a
              href="#contact"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              預約專人諮詢
            </a>
          </div>
        </div>
      </header>

      {/* 主標題 Hero Banner */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-block bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-3 py-1 rounded-full font-medium mb-2">
            合法特區民泊 ‧ 365天全年無休營運 ‧ 一站式在地託管
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            精準佈局大阪關西萬博房產<br />打造穩定高收益民宿資產
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            專為台灣與海外投資人打造！從獨棟鋼構大樓篩選、消防合規改裝格柵，到日本在地經理團隊代管接單，為您開創抗通膨的外幣被動收入。
          </p>
        </div>
      </section>

      {/* 核心內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* 1. 投報率互動試算器 */}
        <section className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>📊</span> 日本民宿投資試算模擬器 (ROI Calculator)
            </h2>
            <span className="text-xs text-slate-400">實時根據參數估算收益</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* 左側：控制參數滑桿 */}
            <div className="lg:col-span-7 space-y-6">
              {/* 物業總價 */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label>預操物業總價：</label>
                  <span className="text-blue-600 font-bold">{propertyPriceJPY.toLocaleString()} 萬日圓 ({formatMoney(priceInJPY)})</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="30000"
                  step="500"
                  value={propertyPriceJPY}
                  onChange={(e) => setPropertyPriceJPY(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* 每日房價 */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label>預估平均每日房價 (ADR)：</label>
                  <span className="text-blue-600 font-bold">{formatMoney(dailyRateJPY)} / 晚</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="60000"
                  step="1000"
                  value={dailyRateJPY}
                  onChange={(e) => setDailyRateJPY(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* 全年入住率 */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label>預估全年住房率 (Occupancy Rate)：</label>
                  <span className="text-blue-600 font-bold">{occupancyRate}% ({bookedDays} 天/年)</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* 營運代管費率 */}
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label>代管團隊營運分潤：</label>
                  <span className="text-blue-600 font-bold">{mgmtFeeRate}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="1"
                  value={mgmtFeeRate}
                  onChange={(e) => setMgmtFeeRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* 右側：計算結果面板 */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">預估投資收益分析</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-600">預估年總營收：</span>
                    <span className="text-lg font-bold text-slate-900">{formatMoney(grossAnnualRevenueJPY)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-600">估計營運費用與固定稅費：</span>
                    <span className="text-sm font-semibold text-red-500">-{formatMoney(mgmtExpenseJPY + fixedCostJPY)}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-600">預估淨年收益 (Net Revenue)：</span>
                    <span className="text-lg font-extrabold text-emerald-600">{formatMoney(netAnnualRevenueJPY)}</span>
                  </div>
                </div>
              </div>

              {/* 投報率 Highlights */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
                <div>
                  <div className="text-xs text-slate-500 font-medium">表面回報率 (Gross)</div>
                  <div className="text-2xl font-black text-blue-600">{grossYield}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">實質回報率 (Net)</div>
                  <div className="text-2xl font-black text-emerald-600">{netYield}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 精選熱門投資標的展示 */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">熱門精選獨棟與特區物業</h2>
              <p className="text-slate-500 text-sm mt-1">皆符合日本旅館業法或特區民泊規範，具備極高改裝升值潛力</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 物業卡片 1 */}
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition">
              <div className="bg-slate-200 h-48 flex items-center justify-center text-slate-400 font-bold">
                大樓外觀圖片 / 1樓格柵工程
              </div>
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">大阪市心齋橋圈</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded">五層獨棟 S 造</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900">心齋橋徒步圈 5層獨棟旅館預定地</h3>
                <p className="text-xs text-slate-500 line-clamp-2">1樓配備合規設計格柵，2樓以上維持精緻格局，可申請 365 天合法經營。</p>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">售價</span>
                    <span className="font-extrabold text-blue-600 text-lg">{formatMoney(85000000)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">預估實質回報</span>
                    <span className="font-extrabold text-emerald-600 text-base">約 8.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 物業卡片 2 */}
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition">
              <div className="bg-slate-200 h-48 flex items-center justify-center text-slate-400 font-bold">
                難波車站周邊高套房
              </div>
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">大阪難波</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">RC 鋼筋混凝土</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900">難波站徒步 6 分鐘 高人氣觀光套房</h3>
                <p className="text-xs text-slate-500 line-clamp-2">交通極度優越，觀光客住房首選，現成運營團隊直接無縫接軌接單。</p>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">售價</span>
                    <span className="font-extrabold text-blue-600 text-lg">{formatMoney(32000000)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">預估實質回報</span>
                    <span className="font-extrabold text-emerald-600 text-base">約 7.2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 物業卡片 3 */}
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition">
              <div className="bg-slate-200 h-48 flex items-center justify-center text-slate-400 font-bold">
                關西萬博概念特區物業
              </div>
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">萬博商圈</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded">特區民泊許可</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900">此花區獨棟民宿 萬博直接受惠區</h3>
                <p className="text-xs text-slate-500 line-clamp-2">鄰近環球影城與夢洲賭場萬博會場，大坪數多人房型，家庭客首選。</p>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">售價</span>
                    <span className="font-extrabold text-blue-600 text-lg">{formatMoney(58000000)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">預估實質回報</span>
                    <span className="font-extrabold text-emerald-600 text-base">約 9.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 一站式服務流程 */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold">一站式跨國資產託管服務</h2>
            <p className="text-slate-400 text-sm">從買房、消防格柵改建，到在地經理營運，您完全不需要飛到日本</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
              <div className="text-3xl">1️⃣</div>
              <div className="font-bold text-base">物業精準選址</div>
              <p className="text-xs text-slate-400">專挑具備 365 天執照潛力的大阪優質獨棟與大樓</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
              <div className="text-3xl">2️⃣</div>
              <div className="font-bold text-base">消防與格柵工程</div>
              <p className="text-xs text-slate-400">協助進行 1 樓格柵改建與符合日本消防法的室內裝修</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
              <div className="text-3xl">3️⃣</div>
              <div className="font-bold text-base">執照申請辦理</div>
              <p className="text-xs text-slate-400">協助取得特區民泊或旅館業營業許可執照</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
              <div className="text-3xl">4️⃣</div>
              <div className="font-bold text-base">在地經理團隊營運</div>
              <p className="text-xs text-slate-400">由 Max 等日本在地團隊負責接單、清潔與現場維護</p>
            </div>
          </div>
        </section>

        {/* 4. 諮詢 CTA 表單 */}
        <section id="contact" className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-6 max-w-3xl mx-auto">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">索取完整大阪房產與民宿投資報告</h2>
            <p className="text-slate-500 text-sm">我們的日本資產顧問將會在 24 小時內與您聯繫，提供詳細收益試算表與獨家物件資訊。</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-left max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">您的姓名 / 稱呼</label>
              <input type="text" placeholder="例如：Jacky 經理" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">聯絡 Email / LINE ID</label>
              <input type="text" placeholder="例如：jacky@example.com 或 LINE ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">預計投資預算</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option>3,000萬 - 5,000萬日圓</option>
                <option>5,000萬 - 1億日圓</option>
                <option>1億日圓以上（獨棟大樓）</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md text-sm"
            >
              立即免費索取與預約諮詢
            </button>
          </form>
        </section>
      </main>

      {/* 頁尾 Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 日本房產與民宿投資專家 (Japan Property Web). All rights reserved.</p>
          <p>免責聲明：本網站所提供之試算數據與回報率皆為模擬推估，實際投資收益將依市場實際營運狀況而定。</p>
        </div>
      </footer>
    </div>
  );
}