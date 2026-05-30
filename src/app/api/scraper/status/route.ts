import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraper/status - Get scraper logs
export async function GET() {
  try {
    const logs = await db.scraperLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
    })

    const totalProducts = await db.importedProduct.count()

    return NextResponse.json({
      logs,
      totalImportedProducts: totalProducts,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
