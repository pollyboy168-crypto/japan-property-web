import { OFFICIAL_LINE_URL } from '@/lib/constants';

export default function ContactCta() {
  return (
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
  );
}
