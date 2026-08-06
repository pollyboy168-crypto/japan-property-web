import { getAllProperties } from '@/lib/properties';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態產生的特殊路由使用 edge runtime
export const runtime = 'edge';

const SITE_URL = 'https://japan.her-yow.com';

export default async function sitemap() {
  const properties = await getAllProperties();

  const propertyUrls = properties.map((property) => ({
    url: `${SITE_URL}/properties/${encodeURIComponent(property.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...propertyUrls
  ];
}
