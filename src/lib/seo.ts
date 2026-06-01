import { Metadata } from 'next'
import { db } from '@/lib/db'

// Cache for site settings to avoid repeated DB queries
let siteSettingsCache: Record<string, string> | null = null
let siteSettingsCacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

/**
 * Get site settings from DB for meta tags
 * Returns a key-value map of all site settings
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (siteSettingsCache && now - siteSettingsCacheTime < CACHE_TTL) {
    return siteSettingsCache
  }

  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) {
      if (s.value != null) {
        map[s.key] = s.value
      }
    }
    siteSettingsCache = map
    siteSettingsCacheTime = now
    return map
  } catch {
    return {}
  }
}

/**
 * Get SEO settings for a specific page type
 */
export async function getSeoSettings(pageType: string) {
  try {
    return await db.seoSetting.findUnique({
      where: { pageType },
    })
  } catch {
    return null
  }
}

/**
 * Replace template variables like {SITE_NAME}, {PRODUCT_NAME}, etc.
 */
export function replaceTemplateVars(
  template: string,
  vars: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

/**
 * Generate metadata for a page (used in generateMetadata or Metadata export)
 */
export async function generatePageMetadata(options: {
  pageType: 'home' | 'product' | 'category' | 'brand' | 'store' | 'legal'
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  variables?: Record<string, string>
  noindex?: boolean
  nofollow?: boolean
}): Promise<Metadata> {
  const [siteSettings, seoSettings] = await Promise.all([
    getSiteSettings(),
    getSeoSettings(options.pageType),
  ])

  const siteName = siteSettings['site_name'] || 'MağazaVitrin'
  const siteUrl = siteSettings['site_url'] || ''
  const defaultDescription =
    siteSettings['site_description'] ||
    "Türkiye'nin en büyük online alışveriş pazaryeri"

  // Build template variables
  const templateVars: Record<string, string> = {
    SITE_NAME: siteName,
    SITE_URL: siteUrl,
    SITE_DESCRIPTION: defaultDescription,
    ...options.variables,
  }

  // Determine title
  let title: string
  if (options.title) {
    title = options.title
  } else if (seoSettings?.titleTemplate) {
    title = replaceTemplateVars(seoSettings.titleTemplate, templateVars)
  } else if (seoSettings?.title) {
    title = replaceTemplateVars(seoSettings.title, templateVars)
  } else {
    title = siteName
  }

  // Determine description
  let description: string
  if (options.description) {
    description = options.description
  } else if (seoSettings?.descriptionTemplate) {
    description = replaceTemplateVars(
      seoSettings.descriptionTemplate,
      templateVars
    )
  } else if (seoSettings?.description) {
    description = replaceTemplateVars(seoSettings.description, templateVars)
  } else {
    description = defaultDescription
  }

  // Determine keywords
  const keywords = options.keywords || seoSettings?.keywords || undefined

  // Determine OG data
  const ogTitle =
    (seoSettings?.ogTitle
      ? replaceTemplateVars(seoSettings.ogTitle, templateVars)
      : undefined) || title
  const ogDescription =
    (seoSettings?.ogDescription
      ? replaceTemplateVars(seoSettings.ogDescription, templateVars)
      : undefined) || description
  const ogImage = options.image || seoSettings?.ogImage || undefined

  // Determine Twitter data
  const twitterTitle =
    (seoSettings?.twitterTitle
      ? replaceTemplateVars(seoSettings.twitterTitle, templateVars)
      : undefined) || ogTitle
  const twitterDescription =
    (seoSettings?.twitterDescription
      ? replaceTemplateVars(seoSettings.twitterDescription, templateVars)
      : undefined) || ogDescription
  const twitterImage =
    options.image || seoSettings?.twitterImage || undefined

  // Canonical URL
  const canonicalUrl = options.url || seoSettings?.canonicalUrl || undefined

  // Robots directive
  const noindex = options.noindex || false
  const nofollow = options.nofollow || false
  const robotsFromSettings = seoSettings?.robotsDirective
  let robotsContent: string | undefined
  if (noindex || nofollow) {
    robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`
  } else if (robotsFromSettings) {
    robotsContent = robotsFromSettings
  }

  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      type: options.pageType === 'product' ? 'product' : 'website',
      siteName,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      ...(twitterImage ? { images: [{ url: twitterImage }] } : {}),
    },
    alternates: {
      ...(canonicalUrl ? { canonical: canonicalUrl } : {}),
    },
    ...(robotsContent ? { robots: { index: !noindex, follow: !nofollow } } : {}),
  }

  return metadata
}

/**
 * Generate JSON-LD Schema for Organization
 */
export function generateOrganizationSchema(
  settings: Record<string, string>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings['site_name'] || 'MağazaVitrin',
    url: settings['site_url'] || '',
    logo: settings['site_logo'] || '',
    description:
      settings['site_description'] ||
      "Türkiye'nin en büyük online alışveriş pazaryeri",
    contactPoint: settings['site_phone']
      ? {
          '@type': 'ContactPoint',
          telephone: settings['site_phone'],
          contactType: 'customer service',
        }
      : undefined,
    sameAs: [
      settings['social_facebook'],
      settings['social_twitter'],
      settings['social_instagram'],
      settings['social_youtube'],
    ].filter(Boolean),
  }
}

/**
 * Generate JSON-LD Schema for WebSite
 */
export function generateWebSiteSchema(
  settings: Record<string, string>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings['site_name'] || 'MağazaVitrin',
    url: settings['site_url'] || '',
    description:
      settings['site_description'] ||
      "Türkiye'nin en büyük online alışveriş pazaryeri",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${settings['site_url'] || ''}/ara?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate JSON-LD Schema for Product
 */
export function generateProductSchema(product: {
  name: string
  description?: string
  image?: string
  sku?: string
  brand?: string
  price: number
  currency?: string
  availability?: string
  condition?: string
  gtin?: string
  mpn?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image || '',
    sku: product.sku || undefined,
    gtin: product.gtin || undefined,
    mpn: product.mpn || undefined,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'TRY',
      availability: product.availability || 'https://schema.org/InStock',
      itemCondition: product.condition || 'https://schema.org/NewCondition',
    },
  }
}

/**
 * Generate JSON-LD Schema for BreadcrumbList
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate JSON-LD Schema for Store (LocalBusiness)
 */
export function generateStoreSchema(store: {
  name: string
  description?: string
  url?: string
  address?: string
  phone?: string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    description: store.description || '',
    url: store.url || '',
    address: store.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: store.address,
        }
      : undefined,
    telephone: store.phone || undefined,
  }
}

/**
 * Generate JSON-LD Schema for FAQPage
 */
export function generateFaqSchema(
  items: { question: string; answer: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * Escape a string for safe inclusion in XML
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Get the site URL from DB settings or fallback
 */
export async function getSiteUrl(): Promise<string> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: 'site_url' },
    })
    if (setting?.value) return setting.value.replace(/\/$/, '')
  } catch {
    // ignore
  }
  return 'https://www.magazavitrin.com'
}

/**
 * Get a single site setting value
 */
export async function getSiteSettingValue(
  key: string
): Promise<string | null> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key } })
    return setting?.value ?? null
  } catch {
    return null
  }
}

/**
 * Get sitemap settings from DB (group="sitemap")
 */
export async function getSitemapSettings(): Promise<Record<string, string>> {
  try {
    const settings = await db.siteSetting.findMany({
      where: { group: 'sitemap' },
    })
    const map: Record<string, string> = {}
    for (const s of settings) {
      if (s.value != null) {
        map[s.key] = s.value
      }
    }
    return map
  } catch {
    return {}
  }
}
