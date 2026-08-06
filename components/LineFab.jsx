import { OFFICIAL_LINE_URL } from '@/lib/constants';
import { trackEvent } from '@/lib/analytics';

// 全站唯一固定詢問鈕：滾動至任何位置都能一鍵詢問官方 LINE
export default function LineFab() {
  return (
    <a
      href={OFFICIAL_LINE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LINE 專人諮詢"
      onClick={() => trackEvent('line_click', { source: 'fab' })}
      className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-900/30 w-14 h-14 flex items-center justify-center text-2xl transition hover:scale-105"
    >
      💬
    </a>
  );
}
