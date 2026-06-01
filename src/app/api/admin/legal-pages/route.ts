import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/legal-pages - Returns all LegalPage records
export async function GET() {
  try {
    const pages = await db.legalPage.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json(pages)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/admin/legal-pages - Create a new LegalPage
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const page = await db.legalPage.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content ?? null,
        type: body.type ?? 'custom',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    return NextResponse.json(page, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/admin/legal-pages - Update multiple LegalPage records
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (Array.isArray(body)) {
      const results = []
      for (const item of body) {
        if (!item.id) continue
        const result = await db.legalPage.update({
          where: { id: item.id },
          data: {
            slug: item.slug,
            title: item.title,
            content: item.content ?? null,
            type: item.type ?? 'custom',
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder ?? 0,
          },
        })
        results.push(result)
      }
      return NextResponse.json({ success: true, count: results.length })
    }

    // Single update
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required for single update' }, { status: 400 })
    }
    const page = await db.legalPage.update({
      where: { id: body.id },
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content ?? null,
        type: body.type ?? 'custom',
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    })
    return NextResponse.json(page)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/admin/legal-pages - Delete a LegalPage by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.legalPage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
