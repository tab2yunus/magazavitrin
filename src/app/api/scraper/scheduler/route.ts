import { NextResponse } from 'next/server'
import { runScraper } from '@/lib/scraper/motolux-scraper'

// ─── SCHEDULER STATE ────────────────────────────────────────
// In-memory state (resets on server restart, but that's OK for a scheduler)
let schedulerRunning = false
let lastSchedulerRun: Date | null = null
let schedulerStatus: 'idle' | 'running' | 'completed' | 'incomplete' = 'idle'
let currentProgress = { categories: 0, totalCategories: 0, products: 0 }

// ─── NIGHTLY SCHEDULER ──────────────────────────────────────
// This endpoint is called externally (cron-job.org, or similar) during 00:00-07:00 Istanbul time
// It runs the scraper to update stock and price of existing products

// GET /api/scraper/scheduler - Check scheduler status
export async function GET() {
  // Check Istanbul time
  const now = new Date()
  const istanbulOffset = 3 * 60 // UTC+3
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const istanbulTime = new Date(utcMs + istanbulOffset * 60000)
  const istanbulHour = istanbulTime.getHours()

  return NextResponse.json({
    status: schedulerStatus,
    running: schedulerRunning,
    lastRun: lastSchedulerRun,
    progress: currentProgress,
    istanbulTime: istanbulTime.toISOString(),
    istanbulHour,
    inScheduleWindow: istanbulHour >= 0 && istanbulHour < 7,
  })
}

// POST /api/scraper/scheduler - Trigger nightly update
// Should be called by external cron every 5-10 minutes during 00:00-07:00 Istanbul time
export async function POST(request: Request) {
  try {
    // Check Istanbul time - only allow 00:00-07:00
    const now = new Date()
    const istanbulOffset = 3 * 60 // UTC+3
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
    const istanbulTime = new Date(utcMs + istanbulOffset * 60000)
    const istanbulHour = istanbulTime.getHours()

    // Allow override for testing
    const body = await request.json().catch(() => ({}))
    const forceRun = body?.force === true

    if (!forceRun && (istanbulHour < 0 || istanbulHour >= 7)) {
      return NextResponse.json({
        success: false,
        message: `Zamanlama penceresi dışında (İstanbul saati: ${istanbulHour}:00). Pencere: 00:00-07:00`,
        istanbulHour,
      }, { status: 400 })
    }

    // Check if already running
    if (schedulerRunning) {
      return NextResponse.json({
        success: true,
        message: 'Zamanlayıcı zaten çalışıyor',
        status: schedulerStatus,
        progress: currentProgress,
      })
    }

    // Check if we already completed a full run today
    if (lastSchedulerRun && schedulerStatus === 'completed') {
      const hoursSinceLastRun = (now.getTime() - lastSchedulerRun.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastRun < 20) {
        return NextResponse.json({
          success: true,
          message: 'Bugünün taraması zaten tamamlandı',
          lastRun: lastSchedulerRun,
          status: schedulerStatus,
        })
      }
    }

    // Start the scheduler
    schedulerRunning = true
    schedulerStatus = 'running'
    currentProgress = { categories: 0, totalCategories: 0, products: 0 }

    // Run scraper in background (non-blocking)
    runScraper({
      delayMs: 1200,
    }).then((result) => {
      schedulerRunning = false
      lastSchedulerRun = new Date()

      if (result.totalErrors > 0 && result.totalScraped === 0) {
        schedulerStatus = 'incomplete'
      } else {
        schedulerStatus = 'completed'
      }

      currentProgress = {
        categories: result.categories,
        totalCategories: result.categories,
        products: result.totalScraped,
      }

      console.log(`[SCHEDULER] Nightly run completed: ${result.totalScraped} scraped, ${result.totalSaved} new, ${result.totalDuplicates} updated, ${result.autoPublished} auto-published, ${result.zeroPriceSkipped} zero-price skipped, ${result.totalErrors} errors`)
    }).catch((err) => {
      schedulerRunning = false
      schedulerStatus = 'incomplete'
      lastSchedulerRun = new Date()
      console.error('[SCHEDULER] Nightly run error:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Gecelik tarama başlatıldı',
      istanbulHour,
    })
  } catch (error: any) {
    schedulerRunning = false
    schedulerStatus = 'incomplete'
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
