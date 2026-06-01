import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/seo-settings - Returns all SeoSetting records
export async function GET() {
  try {
    const settings = await db.seoSetting.findMany({
      orderBy: { pageType: 'asc' },
    })
    return NextResponse.json(settings)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/admin/seo-settings - Upsert multiple SeoSetting records
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be an array' }, { status: 400 })
    }

    const results = []
    for (const item of body) {
      if (!item.pageType) {
        continue
      }
      const result = await db.seoSetting.upsert({
        where: { pageType: item.pageType },
        update: {
          titleTemplate: item.titleTemplate ?? null,
          descriptionTemplate: item.descriptionTemplate ?? null,
          title: item.title ?? null,
          description: item.description ?? null,
          keywords: item.keywords ?? null,
          ogTitle: item.ogTitle ?? null,
          ogDescription: item.ogDescription ?? null,
          ogImage: item.ogImage ?? null,
          twitterTitle: item.twitterTitle ?? null,
          twitterDescription: item.twitterDescription ?? null,
          twitterImage: item.twitterImage ?? null,
          canonicalUrl: item.canonicalUrl ?? null,
          robotsDirective: item.robotsDirective ?? null,
        },
        create: {
          pageType: item.pageType,
          titleTemplate: item.titleTemplate ?? null,
          descriptionTemplate: item.descriptionTemplate ?? null,
          title: item.title ?? null,
          description: item.description ?? null,
          keywords: item.keywords ?? null,
          ogTitle: item.ogTitle ?? null,
          ogDescription: item.ogDescription ?? null,
          ogImage: item.ogImage ?? null,
          twitterTitle: item.twitterTitle ?? null,
          twitterDescription: item.twitterDescription ?? null,
          twitterImage: item.twitterImage ?? null,
          canonicalUrl: item.canonicalUrl ?? null,
          robotsDirective: item.robotsDirective ?? null,
        },
      })
      results.push(result)
    }

    return NextResponse.json({ success: true, count: results.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
