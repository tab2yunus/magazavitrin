import { Metadata } from 'next'
import { db } from '@/lib/db'
import BrandClient from './brand-client'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const brand = await db.brand.findFirst({ where: { slug } })

    return {
      title: brand ? `${brand.name} - MağazaVitrin` : 'Marka - MağazaVitrin',
      description: brand?.seoDescription || brand?.description || `${brand?.name || slug} markasının ürünleri`,
      keywords: [brand?.name, 'motosiklet', 'yedek parça', 'marka'].filter(Boolean) as string[],
      openGraph: {
        title: brand ? `${brand.name} - MağazaVitrin` : 'Marka - MağazaVitrin',
        description: brand?.description || '',
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
