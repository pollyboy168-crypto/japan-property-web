export const runtime = 'edge';

const SITE_URL = 'https://japan.her-yow.com';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
