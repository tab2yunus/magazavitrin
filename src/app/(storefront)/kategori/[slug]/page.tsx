import { Metadata } from 'next'
import { db } from '@/lib/db'
import CategoryClient from './category-client'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const cat = await db.category.findFirst({ where: { slug } })

    return {
      title: cat ? `${cat.name} - MağazaVitrin` : 'Kategori - MağazaVitrin',
      description: cat?.seoDescription || cat?.description || `${cat?.name || slug} kategorisindeki ürünleri keşfedin`,
      keywords: [cat?.name, 'motosiklet', 'yedek parça', slug].filter(Boolean) as string[],
      openGraph: {
        title: cat ? `${cat.name} - MağazaVitrin` : 'Kategori - MağazaVitrin',
        description: cat?.description || '',
      },
      alternates: {
        canonical: `/kategori/${slug}`,
      },
    }
  } catch {
    return { title: 'Kategori - MağazaVitrin' }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  return <CategoryClient slug={slug} />
}
