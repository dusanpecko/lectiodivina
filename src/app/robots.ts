import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/auth/',
        '/_next/',
        '/utils/',
      ],
    },
    sitemap: 'https://lectio.one/sitemap.xml',
  }
}