import { Metadata } from 'next'
import StoreClient from './store-client'

interface StorePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stores/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'Mağaza - MağazaVitrin' }
    
    const store = await res.json()
    
    return {
      title: store.name ? `${store.name} - MağazaVitrin` : 'Mağaza - MağazaVitrin',
      description: store.seoDescription || store.description || `${store.name || slug} mağazasının ürünleri`,
      keywords: [store.name, 'motosiklet', 'yedek parça', 'mağaza'].filter(Boolean),
      openGraph: {
        title: store.name ? `${store.name} - MağazaVitrin` : 'Mağaza - MağazaVitrin',
        description: store.description || '',
        images: store.logo ? [{ url: store.logo }] : [],
      },
      alternates: {
        canonical: `/magaza/${slug}`,
      },
    }
  } catch {
    return { title: 'Mağaza - MağazaVitrin' }
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params
  return <StoreClient slug={slug} />
}
