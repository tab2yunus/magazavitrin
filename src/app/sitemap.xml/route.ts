import { NextResponse } from 'next/server'
import { getSiteUrl, getSitemapSettings, escapeXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = await getSiteUrl()
  const sitemapSettings = await getSitemapSettings()

  const subSitemaps: { loc: string; enabled: boolean }[] = [
    { loc: `${siteUrl}/sitemap-products.xml`, enabled: sitemapSettings['products_enabled'] !== 'false' },
    { loc: `${siteUrl}/sitemap-categories.xml`, enabled: sitemapSettings['categories_enabled'] !== 'false' },
    { loc: `${siteUrl}/sitemap-brands.xml`, enabled: sitemapSettings['brands_enabled'] !== 'false' },
    { loc: `${siteUrl}/sitemap-stores.xml`, enabled: sitemapSettings['stores_enabled'] !== 'false' },
    { loc: `${siteUrl}/sitemap-pages.xml`, enabled: sitemapSettings['pages_enabled'] !== 'false' },
  ]

  const enabledSitemaps = subSitemaps.filter((s) => s.enabled)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${enabledSitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${escapeXml(s.loc)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
