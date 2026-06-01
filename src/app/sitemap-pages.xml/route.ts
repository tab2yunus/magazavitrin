import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteUrl, escapeXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = await getSiteUrl()

  // Static pages
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/ara', changefreq: 'weekly', priority: '0.5' },
  ]

  // Legal pages from DB
  let legalPages: { slug: string; updatedAt: Date }[] = []
  try {
    legalPages = await db.legalPage.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
  } catch {
    // LegalPage table might not exist
  }

  const now = new Date().toISOString()

  const allUrls = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${escapeXml(`${siteUrl}${p.path}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...legalPages.map(
      (p) => `  <url>
    <loc>${escapeXml(`${siteUrl}/${p.slug}`)}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
