import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/properties';
import { formatPropertyPrice, companyInfo } from '@/lib/constants';

// Cloudflare Pages (@cloudflare/next-on-pages) 只支援 edge runtime 的動態路由，
// 且目前不支援 ISR，因此這裡改用「每次請求都重新向 Supabase 抓取」確保資料永遠最新。
// force-dynamic 是必要的：Next.js 預設會把 Server Component 裡的 fetch()
// 結果快取起來（連 supabase-js 底層的 fetch 也一樣），沒有這行會讀到舊資料。
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

export async function generateMetadata({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    return { title: '找不到物件｜株式会社和日' };
  }

  const title = `${property.title}｜${property.location} 投資物件｜株式会社和日`;
  const description = property.description.slice(0, 120);
  const url = `${SITE_URL}/properties/${encodeURIComponent(property.id)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: property.imageUrl }],
      locale: 'zh_TW',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.imageUrl]
    }
  };
}

export default async function PropertyDetailPage({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  const url = `${SITE_URL}/properties/${encodeURIComponent(property.id)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url,
    image: property.images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressCountry: 'JP'
    },
    offers: {
      '@type': 'Offer',
      price: property.priceJPY,
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🏯</span> {companyInfo.jpCompanyName}
          </Link>
          <Link href="/#properties" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← 返回所有物件
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-600">首頁</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#properties" className="hover:text-blue-600">精選物件</Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {property.images.map((imgUrl, index) => (
            <a
              key={index}
              href={imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img
                src={imgUrl}
                alt={`${property.title} 實景照片 ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {property.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{property.title}</h1>
            <p className="text-sm text-slate-500">📍 {property.location} ‧ {property.structure}</p>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 h-fit">
            <div>
              <span className="text-[11px] text-slate-400 block">預售總價 (加價 30% 包套價)</span>
              <span className="font-black text-blue-600 text-2xl block">{formatPropertyPrice(property.priceJPY, 'JPY')}</span>
              <span className="text-xs text-slate-400">約 {formatPropertyPrice(property.priceJPY, 'TWD')}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">預估淨收益率</span>
              <span className="font-bold text-emerald-600 text-lg">{property.roi}%</span>
            </div>

            <a
              href={property.lineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-sm"
            >
              💬 透過 LINE 詢問此物件
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs text-center">
        <p>© 2026 株式会社和日 (Kazuhi Co., Ltd.). All rights reserved.</p>
      </footer>
    </div>
  );
}
