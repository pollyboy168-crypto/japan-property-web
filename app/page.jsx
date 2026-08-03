import YieldCalculator from '../components/YieldCalculator';
import { Building2, Home, ShieldCheck, TrendingUp, Compass, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-400/30">
            台日跨國一站式資產配置顧問
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            輕鬆置產日本，掌握<span className="text-blue-400">合法民宿</span>的高回報收益
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            專為台灣投資人設計。提供合法牌照評估 (新法/特區/旅館業法)、專業營運淨收益試算與一站式包租代管。
          </p>
        </div>
      </section>

      {/* 核心特色 3 大模組 */}
      <section className="max-w-7xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-start gap-4">
            <ShieldCheck className="w-10 h-10 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-lg">100% 合法開照審查</h4>
              <p className="text-sm text-slate-500 mt-1">嚴格查核消防與建築法規，確保購屋後順利取得 180 天或 365 天營運執照。</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-start gap-4">
            <TrendingUp className="w-10 h-10 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-lg">透明淨收益 (Net ROI)</h4>
              <p className="text-sm text-slate-500 mt-1">扣除清掃、平台抽成、水電與固定資產稅，提供最真實的投資回報率報告。</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-start gap-4">
            <Home className="w-10 h-10 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-lg">一站式包租代管</h4>
              <p className="text-sm text-slate-500 mt-1">從軟裝設計、Airbnb 多平台上架到在地 24hr 客服清潔，完全無需勞心。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 殺手級工具：動態計算機 */}
      <section id="minshuku" className="max-w-7xl mx-auto px-4 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h2 className="text-3xl font-bold text-slate-900">民宿收益在線試算</h2>
          <p className="text-slate-600 mt-2">拉動下方參數，了解不同地區與天數限制下的實際純收益</p>
        </div>
        <YieldCalculator />
      </section>

      {/* 精選民宿物件預覽 (MVP 靜態展示) */}
      <section id="properties" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold">精選合法民宿/地產物件</h2>
            <p className="text-slate-500 text-sm">已通過合規評估，具備高投資效益物件</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 物件 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="bg-slate-200 h-48 flex items-center justify-center text-slate-400 font-medium">
              [大阪難波獨棟民泊 實景圖]
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-bold">特區 365 天</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded">近車站4分</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">大阪難波繁華商圈獨棟民宿</h3>
              <p className="text-sm text-slate-500">格局：3LDK | 可容納 8 人 | 現成營運中</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">總價</p>
                  <p className="text-xl font-extrabold text-blue-600">4,800 萬日圓</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">預估淨投報</p>
                  <p className="text-lg font-bold text-emerald-600">8.4%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 物件 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="bg-slate-200 h-48 flex items-center justify-center text-slate-400 font-medium">
              [東京淺草透天厝 實景圖]
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded font-bold">新法 180 天</span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded">觀光大熱門</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">東京淺草寺旁日式風優質透天</h3>
              <p className="text-sm text-slate-500">格局：2LDK | 適合小家庭自住+出租</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">總價</p>
                  <p className="text-xl font-extrabold text-blue-600">5,500 萬日圓</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">預估淨投報</p>
                  <p className="text-lg font-bold text-emerald-600">6.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA 引導 */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4">
            <Compass className="w-12 h-12 text-blue-600" />
            <h3 className="font-bold text-lg text-slate-800">尋找更多非公開隱藏物件？</h3>
            <p className="text-sm text-slate-600">許多高收益日本民宿不公开上架，歡迎告訴我們您的預算與需求。</p>
            <a href="https://line.me" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
              訂製專屬找房需求 <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}