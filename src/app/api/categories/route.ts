import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const flat = searchParams.get('flat')
    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'

    if (flat === 'true') {
      // Return all categories as flat list for admin
      const categories = await db.category.findMany({
        where,
        include: { parent: true, children: true, _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      })
      return NextResponse.json(categories)
    }

    const categories = await db.category.findMany({
      where,
      include: { parent: true, children: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    // Return only top-level categories with children
    const tree = categories.filter(c => !c.parentId)
    return NextResponse.json(tree)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const category = await db.category.create({ data: body })
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
