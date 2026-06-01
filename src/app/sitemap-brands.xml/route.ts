import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteUrl, escapeXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = await getSiteUrl()

  // Query all active brands
  const brands = await db.brand.findMany({
    where: {
      isActive: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${brands
  .map(
    (b) => `  <url>
    <loc>${escapeXml(`${siteUrl}/marka/${b.slug}`)}</loc>
    <lastmod>${b.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
