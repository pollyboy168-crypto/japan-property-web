'use client';
import React, { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';

export default function YieldCalculator() {
  // 試算參數狀態
  const [purchasePrice, setPurchasePrice] = useState(3500); // 萬日圓
  const [adr, setAdr] = useState(22000); // 平均日房價 (日圓)
  const [occupancy, setOccupancy] = useState(70); // 預估住房率 %
  const [licenseType, setLicenseType] = useState('365'); // '180' (新法) 或 '365' (特區/旅館業法)
  const [mgmRate, setMgmRate] = useState(18); // 代管抽成 %

  // 計算邏輯
  const operatingDays = licenseType === '180' ? 180 : 365;
  const priceYen = purchasePrice * 10000; // 總價轉日圓
  const grossIncomeYen = adr * (operatingDays * (occupancy / 100)); // 年總營業額
  
  // 估算成本 (代管費 + 平台費約3% + 水電網路雜費固定估約8%)
  const mgmCost = grossIncomeYen * (mgmRate / 100);
  const platformCost = grossIncomeYen * 0.03;
  const utilityCost = grossIncomeYen * 0.08;
  const totalExpenseYen = mgmCost + platformCost + utilityCost;
  
  const netIncomeYen = grossIncomeYen - totalExpenseYen; // 淨年收益
  const grossROI = ((grossIncomeYen / priceYen) * 100).toFixed(2);
  const netROI = ((netIncomeYen / priceYen) * 100).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 max-w-4xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">日本民宿動態收益試算器</h3>
          <p className="text-sm text-gray-500">自訂營運條件，即時試算扣除代管與營運成本後的淨投報率 (Net ROI)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 控制項控制區 */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              房屋總價：<span className="text-blue-600 text-lg font-bold">{purchasePrice} 萬日圓</span> (約 TWD {(purchasePrice * 0.21).toFixed(0)} 萬)
            </label>
            <input 
              type="range" min="1500" max="15000" step="100"
              value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              牌照類型 / 年營運天數上限
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLicenseType('365')}
                className={`py-2 px-4 rounded-lg font-medium text-sm border transition-all ${
                  licenseType === '365' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                特區/旅館業法 (365天)
              </button>
              <button
                onClick={() => setLicenseType('180')}
                className={`py-2 px-4 rounded-lg font-medium text-sm border transition-all ${
                  licenseType === '180' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                新法民宿 (上限180天)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              預估平均日房價 (ADR)：<span className="text-blue-600 font-bold">{adr.toLocaleString()} 日圓/晚</span>
            </label>
            <input 
              type="range" min="10000" max="80000" step="1000"
              value={adr} onChange={(e) => setAdr(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              預估平均住房率：<span className="text-blue-600 font-bold">{occupancy}%</span>
            </label>
            <input 
              type="range" min="40" max="95" step="5"
              value={occupancy} onChange={(e) => setOccupancy(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* 試算結果數據展示卡片 */}
        <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
              即時財務評估結果
            </span>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400">預估年總營業額</p>
                <p className="text-lg font-bold text-slate-100">¥ {Math.round(grossIncomeYen).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">預估營運成本 (代管+水電)</p>
                <p className="text-lg font-bold text-rose-400">¥ {Math.round(totalExpenseYen).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400">預估淨年收益 (Net Profit)</p>
              <p className="text-3xl font-extrabold text-emerald-400">
                ¥ {Math.round(netIncomeYen).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <p className="text-xs text-slate-400">預估表面投報率</p>
                <p className="text-xl font-bold text-slate-200">{grossROI}%</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-emerald-500/30">
                <p className="text-xs text-emerald-400 font-medium">預估實質淨投報 (Net)</p>
                <p className="text-xl font-bold text-emerald-400">{netROI}%</p>
              </div>
            </div>
          </div>

          <a 
            href="https://line.me" target="_blank" rel="noreferrer"
            className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-center transition-colors block"
          >
            索取此物件完整營運報告 (加 Line 諮詢)
          </a>
        </div>
      </div>
    </div>
  );
}