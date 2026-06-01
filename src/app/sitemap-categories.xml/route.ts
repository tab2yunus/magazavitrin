import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteUrl, escapeXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = await getSiteUrl()

  // Query all active categories
  const categories = await db.category.findMany({
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
${categories
  .map(
    (c) => `  <url>
    <loc>${escapeXml(`${siteUrl}/kategori/${c.slug}`)}</loc>
    <lastmod>${c.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
