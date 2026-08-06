'use client';

import { trackEvent } from '@/lib/analytics';

// 純粹是一個會送 GA4 line_click 事件的 <a>，讓 server component
// （例如物件詳情頁）也能追蹤 LINE 點擊，不需要把整頁改成 client component。
export default function LineClickLink({ href, source, propertyId, className, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('line_click', { source, property_id: propertyId || null })}
      className={className}
    >
      {children}
    </a>
  );
}
