import { Metadata } from 'next'
import { db } from '@/lib/db'
import { generatePageMetadata, generateBreadcrumbSchema } from '@/lib/seo'
import CategoryClient from './category-client'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const cat = await db.category.findFirst({ where: { slug } })
    if (!cat) return { title: 'Kategori - MağazaVitrin' }

    const title = cat.seoTitle || `${cat.name} Ürünleri`
    const description = cat.seoDescription || cat.description || `${cat.name} kategorisindeki ürünleri keşfedin`

    return generatePageMetadata({
      pageType: 'category',
      title,
      description,
      keywords: [cat.name, 'motosiklet', 'yedek parça', slug].filter(Boolean) as string[],
      url: `/kategori/${slug}`,
      variables: {
        CATEGORY_NAME: cat.name,
        DESCRIPTION: cat.description || '',
      },
    })
  } catch {
    return { title: 'Kategori - MağazaVitrin' }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  let cat = null
  try {
    cat = await db.category.findFirst({ where: { slug }, include: { parent: true } })
  } catch { /* ignore */ }

  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Ana Sayfa', url: '/' },
  ]
  if (cat?.parent) {
    breadcrumbItems.push({ name: cat.parent.name, url: `/kategori/${cat.parent.slug}` })
  }
  if (cat) {
    breadcrumbItems.push({ name: cat.name, url: `/kategori/${cat.slug}` })
  }
  const breadcrumbLd = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CategoryClient slug={slug} />
    </>
  )
}
