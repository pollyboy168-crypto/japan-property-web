import { getAllProperties } from '@/lib/properties';
import { getPublishedPosts } from '@/lib/blog';
import { getLatestNews } from '@/lib/news';

// Cloudflare Pages (@cloudflare/next-on-pages) 要求動態產生的特殊路由使用 edge runtime
// force-dynamic 避免 Next.js 快取住 Supabase 查詢結果
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://japan.her-yow.com';

export default async function sitemap() {
  const [properties, posts, news] = await Promise.all([getAllProperties(), getPublishedPosts(), getLatestNews(100)]);

  const propertyUrls = properties.map((property) => ({
    url: `${SITE_URL}/properties/${encodeURIComponent(property.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  const blogUrls = posts.map((post) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  const newsUrls = news.map((item) => ({
    url: `${SITE_URL}/news/${encodeURIComponent(item.slug)}`,
    lastModified: item.published_at ? new Date(item.published_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.6
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    ...propertyUrls,
    ...blogUrls,
    ...newsUrls
  ];
}
