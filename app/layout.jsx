import './globals.css';
import { companyInfo } from '@/lib/constants';

const SITE_URL = 'https://japan.her-yow.com';

export const metadata = {
  title: '日本地產與民宿投資專家｜一站式置產與託管顧問',
  description: '專為台灣買家打造的日本不動產與合法民宿投資平台，提供精準物件評估、180天/365天牌照分析與包租代管服務。',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: companyInfo.jpCompanyName,
  legalName: companyInfo.jpCompanyEn,
  url: SITE_URL,
  email: companyInfo.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: companyInfo.address,
    addressCountry: 'JP'
  },
  identifier: companyInfo.licenseNo
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-50 text-slate-800 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}