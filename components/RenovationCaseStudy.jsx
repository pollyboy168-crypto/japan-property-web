// 一站式改建與營運成功案例：說明公司自己的改建流程方法論，
// 屬於評述性行銷文案，跟個別物件資料無關，不需要從 Supabase 讀取。
export default function RenovationCaseStudy() {
  return (
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
            鎖定能快速抵達心齋橋、難波、環球影城等觀光熱點的交通節點——不必是蛋黃區，取得成本更低但住客移動時間差異不大——且建物構造具備特區民泊申請資格的獨棟建築。
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
            由在地團隊對應國際觀光客，創造穩定高住房率後，掛牌帶租約出售給海外買家。
          </p>
        </div>
      </div>
    </section>
  );
}
