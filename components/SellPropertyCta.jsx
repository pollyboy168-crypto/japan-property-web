import SellPropertyModal from '@/components/SellPropertyModal';

// 賣方入口區塊。放在物件牆下方——會滑到這裡的人，通常是把物件看過一輪
// 才意識到「我手上那棟也可以放上來」，這時候提出邀請的接受度最高。
// 刻意跟買方的藍色調分開用綠色，讓賣方一眼認出這段不是在賣他東西。
export default function SellPropertyCta() {
  return (
    <section
      id="sell"
      className="scroll-mt-20 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
    >
      <div className="md:col-span-2 space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">For Sellers</span>
        <h2 className="text-2xl font-extrabold text-slate-900">手上有大阪物件想出售？免費刊登</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          我們是日本在地合法登記法人（{'株式会社和日'}），自營大阪特區民泊、也實際做過整棟改建與出場，
          知道台灣買家在意什麼、日方仲介會卡在哪裡。您的物件會直接曝光給站上的台灣買家。
        </p>
        <ul className="text-sm text-slate-700 space-y-1.5 pt-1">
          <li>✅ 刊登完全免費，成交才收服務費</li>
          <li>✅ 上架後標示「<strong>屋主直售</strong>」，買家知道能直接談，不是層層轉手</li>
          <li>✅ 有民泊／旅館業執照的物件優先處理</li>
          <li>✅ 您的聯絡方式不會公開在網站上，由我們專員居中對接</li>
        </ul>
        <p className="text-xs text-slate-500 pt-1">
          送出後我們會先與您確認物件細節，確認無誤才會上架——不會未經查證就把您的物件公開。
        </p>
      </div>

      <div className="flex justify-center">
        <SellPropertyModal variant="inline" />
      </div>
    </section>
  );
}
