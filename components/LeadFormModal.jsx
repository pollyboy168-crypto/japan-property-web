'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

// 共用留名單表單，兩種外觀：
// - variant="fab"：首頁固定浮動按鈕
// - variant="inline"：物件詳情頁的區塊按鈕，會帶入該物件資訊
export default function LeadFormModal({ variant = 'fab', propertyId, propertyTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState(propertyTitle ? `我對「${propertyTitle}」感興趣，請提供更多資訊。` : '');
  const [website, setWebsite] = useState(''); // honeypot，人類看不到
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const resetAndClose = () => {
    setIsOpen(false);
    setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          message,
          propertyId,
          propertyTitle,
          sourceUrl: window.location.href,
          website
        })
      });

      if (!res.ok) throw new Error('submit failed');

      setStatus('success');
      trackEvent('lead_submitted', { property_id: propertyId || null });
    } catch (err) {
      setStatus('error');
    }
  };

  const trigger =
    variant === 'fab' ? (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="留下聯絡方式"
        className="fixed bottom-24 right-5 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl transition hover:scale-105"
      >
        📝
      </button>
    ) : (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-xl transition"
      >
        📝 留下聯絡方式，我們主動聯繫您
      </button>
    );

  return (
    <>
      {trigger}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={resetAndClose}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-900">留下聯絡方式</h3>
                <p className="text-xs text-slate-500 mt-1">留下資料後，株式会社和日專員會主動與您聯繫</p>
              </div>
              <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 text-xl px-1">✕</button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-3xl">✅</p>
                <p className="text-sm font-semibold text-slate-900">已收到您的資料，我們會盡快與您聯繫！</p>
                <button onClick={resetAndClose} className="text-xs text-blue-600 hover:underline mt-2">關閉</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">姓名</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">電話或 LINE ID</label>
                  <input
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">留言（選填）</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* honeypot：一般訪客看不到，機器人才會填 */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-rose-600">送出失敗，請稍後再試，或直接透過 LINE 詢問。</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
                >
                  {status === 'submitting' ? '送出中...' : '送出'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
