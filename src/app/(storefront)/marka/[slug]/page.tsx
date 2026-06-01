import { Metadata } from 'next'
import { db } from '@/lib/db'
import { generatePageMetadata, generateBreadcrumbSchema } from '@/lib/seo'
import BrandClient from './brand-client'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const brand = await db.brand.findFirst({ where: { slug } })
    if (!brand) return { title: 'Marka - MağazaVitrin' }

    const title = brand.seoTitle || `${brand.name} Yedek Parça`
    const description = brand.seoDescription || brand.description || `${brand.name} markasının ürünleri`

    return generatePageMetadata({
      pageType: 'brand',
      title,
      description,
      keywords: [brand.name, 'motosiklet', 'yedek parça', 'marka'].filter(Boolean) as string[],
      image: brand.logo || undefined,
      url: `/marka/${slug}`,
      variables: {
        BRAND_NAME: brand.name,
        DESCRIPTION: brand.description || '',
      },
    })
  } catch {
    return { title: 'Marka - MağazaVitrin' }
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params

  let brand = null
  try {
    brand = await db.brand.findFirst({ where: { slug } })
  } catch { /* ignore */ }

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: '/' },
    ...(brand ? [{ name: brand.name, url: `/marka/${brand.slug}` }] : []),
  ]
  const breadcrumbLd = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BrandClient slug={slug} />
    </>
  )
}
