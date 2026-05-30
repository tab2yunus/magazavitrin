import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stores
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'

    const stores = await db.store.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(stores)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/stores
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const store = await db.store.create({ data: body })
    return NextResponse.json(store, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
