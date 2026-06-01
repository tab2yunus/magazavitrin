import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraper/providers - Get all scraper providers with stats
export async function GET() {
  try {
    // Get stats for MOTOLUX provider
    const [
      totalImported,
      totalPublished,
      totalUnpublished,
      totalCategories,
      lastLog,
      totalErrors,
    ] = await Promise.all([
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX' } }),
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX', isPublished: true } }),
      db.importedProduct.count({ where: { sourceSupplier: 'MOTOLUX', isPublished: false } }),
      db.importedProduct.findMany({
        where: { sourceSupplier: 'MOTOLUX' },
        select: { category: true },
        distinct: ['category'],
      }),
      db.scraperLog.findFirst({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
      }),
      db.scraperLog.count({ where: { status: 'failed' } }),
    ])

    // Get unique supplier names from DB (for future multi-provider support)
    const suppliers = await db.importedProduct.findMany({
      select: { sourceSupplier: true },
      distinct: ['sourceSupplier'],
    })

    const providers = suppliers.map(s => ({
      id: s.sourceSupplier.toLowerCase(),
      name: s.sourceSupplier,
      slug: s.sourceSupplier.toLowerCase(),
      type: 'web_scraper',
      isActive: true,
      baseUrl: 'https://b2b.motolux.com.tr',
      stats: {
        totalImported,
        totalPublished,
        totalUnpublished,
        totalCategories: totalCategories.filter(c => c.category).length,
        totalErrors,
        lastScrapeAt: lastLog?.completedAt || null,
        lastScrapeStatus: lastLog?.status || null,
      },
    }))

    // If no suppliers in DB yet, still show MOTOLUX as available
    if (providers.length === 0) {
      providers.push({
        id: 'motolux',
        name: 'MOTOLUX',
        slug: 'motolux',
        type: 'web_scraper',
        isActive: true,
        baseUrl: 'https://b2b.motolux.com.tr',
        stats: {
          totalImported: 0,
          totalPublished: 0,
          totalUnpublished: 0,
          totalCategories: 0,
          totalErrors: 0,
          lastScrapeAt: null,
          lastScrapeStatus: null,
        },
      })
    }

    return NextResponse.json({ providers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
