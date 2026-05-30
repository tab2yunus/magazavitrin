import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json([])

    const user = session.user as any
    const comparisons = await db.comparison.findMany({
      where: { userId: user.id },
      include: { product: { include: { brand: true, category: true, images: { take: 1 }, attributes: true, variations: true } } },
    })
    return NextResponse.json(comparisons)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    const { productId } = await request.json()

    const count = await db.comparison.count({ where: { userId: user.id } })
    if (count >= 4) return NextResponse.json({ error: 'En fazla 4 ürün karşılaştırabilirsiniz' }, { status: 400 })

    const comp = await db.comparison.create({ data: { userId: user.id, productId } })
    return NextResponse.json(comp, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    const { productId } = await request.json()

    await db.comparison.deleteMany({ where: { userId: user.id, productId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
