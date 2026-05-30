import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'

    const banners = await db.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const banner = await db.banner.create({ data: body })
    return NextResponse.json(banner, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
