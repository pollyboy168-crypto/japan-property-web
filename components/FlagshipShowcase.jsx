import Link from 'next/link';
import { formatPropertyPrice, companyInfo } from '@/lib/constants';
import LineClickLink from '@/components/LineClickLink';

// 旗艦民宿黃金案例區塊：株式会社和日自營的 Shinsai Wings，資料仍是從
// Supabase properties 表讀出（id='prop-shinsai-wings'，見 lib/properties.js
// 的 getAllProperties()），不是寫死的假資料，只是在畫面上給它特別的展示位置。
// 找不到這筆資料（例如 Supabase 端被誤刪）時整個區塊不渲染，不強迫顯示空狀態。
export default function FlagshipShowcase({ properties }) {
  const flagship = properties.find((item) => item.id === 'prop-shinsai-wings');
  if (!flagship) return null;

  return (
    <section id="flagship" className="scroll-mt-20 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-amber-500/40 shadow-2xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="bg-amber-500 text-slate-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            👑 株式會社和日 直營旗艦物業
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-3">{flagship.title}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {flagship.location} ‧ 完美改建示範標的 ‧ 帶 365 天執照與現成營運團隊出售
          </p>
        </div>
        <div className="text-right bg-slate-800/90 p-4 rounded-2xl border border-amber-500/40">
          <span className="text-[11px] text-slate-400 block line-through decoration-slate-500">市場行情價 {formatPropertyPrice(flagship.marketPriceJPY, 'JPY')}</span>
          <span className="text-xs text-amber-400 font-bold block">獨家破盤售價</span>
          <span className="text-3xl font-black text-amber-400">{formatPropertyPrice(flagship.priceJPY, 'JPY')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="text-2xl">🏗️</div>
          <h3 className="font-bold text-lg text-white">1 樓專業格柵與消防工程</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            由和日工程團隊親自規劃，1 樓完成合規格柵工法與結構強化，2-5 樓完美保持旅宿格局，順利通過日本消防嚴格複驗。
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="text-2xl">📜</div>
          <h3 className="font-bold text-lg text-white">365 天特區民泊營業許可</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            擺脫一般民宿 180 天營運限制！擁有大阪特區民泊/旅館業完整許可，全年 365 天無間斷接單，收益最大化。
          </p>
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="text-2xl">🤝</div>
          <h3 className="font-bold text-lg text-white">在地團隊無縫接管</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            附帶成熟營運軟硬體！由日本在地經理團隊負責清潔、現場房客對應與多平台接單，買下即刻接手穩定現金流。
          </p>
        </div>
      </div>

      {/* 交通條：這棟在大正區、不是心齋橋那種蛋黃區，取得成本低是它的賣點，
          但「便宜」要有說服力就得讓買家一眼看到移動時間其實沒差多少，
          所以把站數直接攤在畫面上，而不是只寫在下面的說明文字裡。
          站數都是實際查證過的（大正站→心齋橋為長堀鶴見綠地線 4 站直達）。 */}
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚉</span>
          <h3 className="font-bold text-white">大正站雙鐵共構　JR 大阪環狀線 ✕ 大阪Metro長堀鶴見綠地線</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { place: '京セラドーム大阪', detail: '地鐵 1 站' },
            { place: '心齋橋', detail: '地鐵 4 站直達' },
            { place: '難波', detail: '心齋橋轉乘 1 站' },
            { place: '環球影城 USJ', detail: 'JR 西九条轉夢咲線' }
          ].map((item) => (
            <div key={item.place} className="bg-slate-900/60 rounded-xl px-3 py-3 border border-slate-700/50">
              <div className="text-sm font-bold text-amber-400">{item.place}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">{item.detail}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          取得成本明顯低於心齋橋、難波等蛋黃區，但住客實際的移動時間差異不大。對「行李少走路、換車次數少」的家庭客與團體客來說，雙鐵共構往往比地段名氣更有吸引力。
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
        <div className="text-xs text-slate-300">
          💡 歡迎預約現場/線上看房，或點擊連結查看房客預訂實況與評價。
        </div>
        <div className="flex gap-3 shrink-0">
          <a
            href={companyInfo.flagshipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
          >
            🌐 房客預訂官網
          </a>
          <LineClickLink
            href={flagship.lineLink}
            source="flagship_showcase"
            propertyId={flagship.id}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg"
          >
            💬 詢問此旗艦物業 ➔
          </LineClickLink>
        </div>
      </div>
    </section>
  );
}
