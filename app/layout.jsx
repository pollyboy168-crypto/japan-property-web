import './globals.css';
import { companyInfo } from '@/lib/constants';
import { PRIMARY_KEYWORDS, FAQ_ITEMS } from '@/lib/seoKeywords';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const SITE_URL = 'https://japan.her-yow.com';

const TITLE = '日本買房・大阪不動產投資｜台灣人置產與民泊代管一站式顧問｜株式会社和日';
const DESCRIPTION =
  '台灣人買日本房產的一站式顧問：大阪收益物件即時上架、特區民泊 365 天牌照解析、投報率試算、貸款與稅費規劃、購入後包租代管。株式会社和日為日本在地合法登記法人，提供從選物件、改建到營運出場的完整服務。';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s｜株式会社和日'
  },
  description: DESCRIPTION,
  keywords: PRIMARY_KEYWORDS,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: '株式会社和日 Kazuhi Co., Ltd.',
    locale: 'zh_TW',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
  }
};

// 三組結構化資料：
//  - RealEstateAgent（比泛用的 Organization 更精確地描述本站業態，
//    Google 對行業別 schema 的理解會更好）
//  - WebSite（讓 Google 知道站內搜尋入口）
//  - FAQPage（爭取 FAQ rich result，對應長尾問句型搜尋）
const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      '@id': `${SITE_URL}/#organization`,
      name: companyInfo.jpCompanyName,
      legalName: companyInfo.jpCompanyEn,
      url: SITE_URL,
      email: companyInfo.email,
      description: DESCRIPTION,
      areaServed: [
        { '@type': 'City', name: '大阪市' },
        { '@type': 'AdministrativeArea', name: '大阪府' }
      ],
      knowsLanguage: ['zh-TW', 'ja', 'en'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: companyInfo.address,
        addressCountry: 'JP'
      },
      identifier: companyInfo.licenseNo
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: '株式会社和日 日本房產投資平台',
      inLanguage: 'zh-TW',
      publisher: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
