import { NextResponse } from 'next/server'
import { runScraper } from '@/lib/scraper/motolux-scraper'

// POST /api/scraper/start - Start scraping job
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { maxProducts, categoryFilter, delayMs } = body

    // Run scraper and wait for result
    const result = await runScraper({
      maxProducts: maxProducts || 0,
      categoryFilter: categoryFilter || undefined,
      delayMs: delayMs || 1500,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
