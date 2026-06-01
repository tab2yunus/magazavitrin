import { Metadata } from 'next'
import { db } from '@/lib/db'
import { generatePageMetadata, generateBreadcrumbSchema, generateStoreSchema } from '@/lib/seo'
import StoreClient from './store-client'

interface StorePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const store = await db.store.findFirst({ where: { slug } })
    if (!store) return { title: 'Mağaza - MağazaVitrin' }

    const title = store.seoTitle || `${store.name} Mağazası`
    const description = store.seoDescription || store.description || `${store.name} mağazasının ürünleri`

    return generatePageMetadata({
      pageType: 'store',
      title,
      description,
      keywords: [store.name, store.city, 'motosiklet', 'yedek parça', 'mağaza'].filter(Boolean) as string[],
      image: store.logo || undefined,
      url: `/magaza/${slug}`,
      variables: {
        STORE_NAME: store.name,
        CITY: store.city || '',
        DESCRIPTION: store.description || '',
      },
    })
  } catch {
    return { title: 'Mağaza - MağazaVitrin' }
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params

  let store = null
  try {
    store = await db.store.findFirst({ where: { slug } })
  } catch { /* ignore */ }

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: '/' },
    ...(store ? [{ name: store.name, url: `/magaza/${store.slug}` }] : []),
  ]
  const breadcrumbLd = generateBreadcrumbSchema(breadcrumbItems)

  const storeLd = store ? generateStoreSchema({
    name: store.name,
    description: store.description || undefined,
    url: `/magaza/${store.slug}`,
    address: store.city || undefined,
    phone: undefined,
  }) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {storeLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeLd) }}
        />
      )}
      <StoreClient slug={slug} />
    </>
  )
}
