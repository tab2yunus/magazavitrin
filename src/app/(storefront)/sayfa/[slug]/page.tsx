import { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import LegalPageClient from './legal-client'

interface LegalPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const page = await db.legalPage.findFirst({ where: { slug, isActive: true } })
    if (!page) return { title: 'Sayfa - MağazaVitrin' }

    return {
      title: page.title,
      description: page.content?.substring(0, 160) || page.title,
      alternates: { canonical: `/sayfa/${slug}` },
    }
  } catch {
    return { title: 'Sayfa - MağazaVitrin' }
  }
}

export default async function LegalPageRoute({ params }: LegalPageProps) {
  const { slug } = await params

  let page = null
  try {
    page = await db.legalPage.findFirst({ where: { slug, isActive: true } })
  } catch { /* ignore */ }

  if (!page) notFound()

  return <LegalPageClient title={page.title} content={page.content || ''} />
}
