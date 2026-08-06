import { companyInfo, OFFICIAL_LINE_URL } from '@/lib/constants';

export default function SiteHeader({ propertiesCount, currency, setCurrency }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏯</span>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-none">
              {companyInfo.jpCompanyName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">
              {companyInfo.jpCompanyEn} ｜ 大阪賭場與資產管理專家
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#why-osaka" className="hover:text-blue-600 transition">大阪核心吸引力</a>
          <a href="#calculator" className="hover:text-blue-600 transition">投資試算</a>
          <a href="#flagship" className="hover:text-blue-600 transition">旗艦民宿 (Shinsai Wings)</a>
          <a href="#properties" className="hover:text-blue-600 transition">精選物件 ({propertiesCount})</a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setCurrency('JPY')}
              className={`px-2.5 py-1 rounded transition ${currency === 'JPY' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              日圓
            </button>
            <button
              onClick={() => setCurrency('TWD')}
              className={`px-2.5 py-1 rounded transition ${currency === 'TWD' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              台幣
            </button>
          </div>

          <a
            href={OFFICIAL_LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <span>💬</span> LINE 諮詢
          </a>
        </div>
      </div>
    </header>
  );
}
