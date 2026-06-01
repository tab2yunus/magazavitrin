import { Metadata } from 'next'
import BrandClient from './brand-client'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/brands/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'Marka - MağazaVitrin' }
    
    const brand = await res.json()
    
    return {
      title: brand.name ? `${brand.name} - MağazaVitrin` : 'Marka - MağazaVitrin',
      description: brand.seoDescription || brand.description || `${brand.name || slug} markasının ürünleri`,
      keywords: [brand.name, 'motosiklet', 'yedek parça', 'marka'].filter(Boolean),
      openGraph: {
        title: brand.name ? `${brand.name} - MağazaVitrin` : 'Marka - MağazaVitrin',
        description: brand.description || '',
      },
      alternates: {
        canonical: `/marka/${slug}`,
      },
    }
  } catch {
    return { title: 'Marka - MağazaVitrin' }
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params
  return <BrandClient slug={slug} />
}
