import { FAQ_ITEMS } from '@/lib/seoKeywords';

// 常見問題區塊：同時服務兩個目的
//  1. 對訪客——這些是台灣買家真的會問的問題，答案有實際資訊量
//  2. 對 SEO——搭配 layout.jsx 輸出的 FAQPage JSON-LD，爭取 Google 的
//     FAQ rich result，讓長尾問句型搜尋（「台灣人可以在日本買房嗎」）
//     能對應到本站真實存在的內容，而不是靠關鍵字堆砌
export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">FAQ</span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">台灣人買日本房產　常見問題</h2>
        <p className="text-slate-500 text-sm mt-1">關於資格、稅費、投報率、民泊法規與代管，我們最常被問到的問題</p>
      </div>

      <div className="divide-y divide-slate-100">
        {FAQ_ITEMS.map((item, idx) => (
          <details key={idx} className="group py-4">
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{item.q}</h3>
              <span className="text-slate-400 text-lg shrink-0 transition-transform group-open:rotate-45">＋</span>
            </summary>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
