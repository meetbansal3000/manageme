// Next.js Dynamic Robots Configuration for manageme OS

export default function robots() {
  const baseUrl = 'https://manageme-three.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/_next/',
          '/static/private/'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
