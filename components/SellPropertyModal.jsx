'use client';

import { useState } from 'react';

// ----------------------------------------------------------------
// 🏠 屋主刊登出售表單
//
// 送出後進的是待審核表，不會直接上架（見 app/api/list-property/route.js）。
// 表單上要把這件事講清楚——屋主填完以為馬上就看得到，結果找不到自己的
// 物件，只會打電話來問，不如一開始就說明流程。
//
// 必填只有四個欄位（姓名、聯絡方式、物件名稱、地點），其餘全部選填。
// 賣房的人手上不見得有精確的坪數與建築年，硬性必填只會讓人填假資料或
// 直接放棄，反而拿不到聯絡方式——先接到人，細節可以後續電話問。
// ----------------------------------------------------------------
export default function SellPropertyModal({ variant = 'inline' }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setOpen(false);
    setDone(false);
    setError('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      ownerName: fd.get('ownerName'),
      ownerContact: fd.get('ownerContact'),
      title: fd.get('title'),
      location: fd.get('location'),
      price: fd.get('price'),
      propertyType: fd.get('propertyType'),
      sizeSqm: fd.get('sizeSqm'),
      buildYear: fd.get('buildYear'),
      hasMinpaku: fd.get('hasMinpaku') === 'on',
      note: fd.get('note'),
      website: fd.get('website'), // honeypot
      sourceUrl: typeof window !== 'undefined' ? window.location.href : ''
    };

    try {
      const res = await fetch('/api/list-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '送出失敗');
      setDone(true);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'property_submitted');
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSending(false);
    }
  }

  const triggerClass =
    variant === 'nav'
      ? 'text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition'
      : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg';

  const field =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClass}>
        {variant === 'nav' ? '我要賣房' : '🏠 免費刊登我的物件'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" onClick={close}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">屋主刊登出售</h3>
                <p className="text-xs text-slate-500 mt-1">
                  大阪地區物件免費刊登。送出後由我們專員與您確認細節，確認無誤才會上架。
                </p>
              </div>
              <button onClick={close} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
                ✕
              </button>
            </div>

            {done ? (
              <div className="py-8 text-center space-y-3">
                <div className="text-4xl">✅</div>
                <p className="font-bold text-slate-900">已收到您的物件資料</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  我們會盡快與您聯繫確認細節。<br />
                  確認無誤後才會上架，屆時會標示為「屋主直售」。
                </p>
                <button onClick={close} className="mt-2 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
                  關閉
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* honeypot：藏起來給機器人填的欄位 */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 h-0 w-0 -z-10"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">您的姓名 *</label>
                    <input name="ownerName" required className={field} placeholder="王先生" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">聯絡方式 *</label>
                    <input name="ownerContact" required className={field} placeholder="電話或 LINE ID" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">物件名稱 / 標題 *</label>
                  <input name="title" required className={field} placeholder="大正區整棟透天，附民泊執照" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">物件地點 *</label>
                  <input name="location" required className={field} placeholder="大阪市大正區三軒家東" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">期望售價（萬日圓）</label>
                    <input name="price" inputMode="numeric" className={field} placeholder="11980" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">物件類型</label>
                    <select name="propertyType" className={field} defaultValue="">
                      <option value="">請選擇</option>
                      <option>整棟公寓（一棟マンション）</option>
                      <option>整棟公寓（一棟アパート）</option>
                      <option>透天／一戶建</option>
                      <option>區分所有（單戶）</option>
                      <option>店舖／事務所</option>
                      <option>土地</option>
                      <option>其他</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">建物面積（㎡）</label>
                    <input name="sizeSqm" inputMode="decimal" className={field} placeholder="120.5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">建築年 / 屋齡</label>
                    <input name="buildYear" className={field} placeholder="1997 年" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <input type="checkbox" name="hasMinpaku" className="accent-emerald-600" />
                  已取得民泊 / 旅館業執照（有執照的物件我們會優先處理）
                </label>

                <div>
                  <label className="text-xs font-bold text-slate-700">補充說明</label>
                  <textarea
                    name="note"
                    rows={3}
                    className={field}
                    placeholder="租約狀況、目前收益、是否含車位、希望成交時間…"
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
                >
                  {sending ? '送出中…' : '送出刊登申請'}
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  送出即表示同意我們與您聯繫確認物件細節。您留下的聯絡方式僅用於本次刊登事宜，不會公開顯示在網站上。
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
