import { NextResponse } from 'next/server'
import { runScraper } from '@/lib/scraper/motolux-scraper'

// POST /api/scraper/start - Start scraping job (non-blocking)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { maxProducts, categoryFilter, delayMs } = body

    // Run scraper in background - don't await it
    // The result can be checked via /api/scraper/status
    runScraper({
      maxProducts: maxProducts || 0,
      categoryFilter: categoryFilter || undefined,
      delayMs: delayMs || 1500,
    }).catch((err) => {
      console.error('[SCRAPER] Background error:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Scraping başlatıldı. Durumu /api/scraper/status adresinden takip edebilirsiniz.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
