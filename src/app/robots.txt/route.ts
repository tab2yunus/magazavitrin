import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  let robotsEnabled = true
  let customContent = ''
  let siteUrl = ''

  try {
    // Check if robots.txt is enabled
    const enabledSetting = await db.siteSetting.findUnique({
      where: { key: 'robots_enabled' },
    })
    if (enabledSetting?.value === 'false') {
      robotsEnabled = false
    }

    // Get custom robots.txt content
    const contentSetting = await db.siteSetting.findUnique({
      where: { key: 'robots_content' },
    })
    if (contentSetting?.value) {
      customContent = contentSetting.value
    }

    siteUrl = await getSiteUrl()
  } catch {
    // DB might not be available; use defaults
    siteUrl = 'https://www.magazavitrin.com'
  }

  let content: string

  if (!robotsEnabled) {
    // If robots is disabled, disallow everything
    content = 'User-agent: *\nDisallow: /'
  } else if (customContent) {
    // Use custom content
    content = customContent
    // Add sitemap line if not already present
    if (!content.includes('Sitemap:')) {
      content += `\n\nSitemap: ${siteUrl}/sitemap.xml`
    }
  } else {
    // Default robots.txt
    content = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# Disallow admin and API routes
User-agent: *
Disallow: /admin
Disallow: /api/
Disallow: /hesabim
Disallow: /sepet
Disallow: /odeme
Disallow: /siparislerim
Disallow: /favorilerim
Disallow: /karsilastirma
Disallow: /giris
Disallow: /kayit`
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
