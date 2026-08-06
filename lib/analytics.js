'use client';

// 安全呼叫 GA4 的 gtag，GA4 腳本還沒載入或使用者擋了追蹤時靜默不做事
export function trackEvent(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
