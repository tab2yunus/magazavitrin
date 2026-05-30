import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const brand = await db.brand.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { products: { where: { isActive: true }, take: 20, include: { store: true, category: true, images: { take: 1 } } } },
    })
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    return NextResponse.json(brand)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const brand = await db.brand.update({ where: { id }, data: body })
    return NextResponse.json(brand)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.brand.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
