import { Metadata } from 'next'
import CategoryClient from './category-client'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/categories?flat=true`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'Kategori - MağazaVitrin' }
    
    const cats = await res.json()
    const cat = cats.find((c: any) => c.slug === slug)
    
    return {
      title: cat ? `${cat.name} - MağazaVitrin` : 'Kategori - MağazaVitrin',
      description: cat?.seoDescription || cat?.description || `${cat?.name || slug} kategorisindeki ürünleri keşfedin`,
      keywords: [cat?.name, 'motosiklet', 'yedek parça', slug].filter(Boolean),
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
