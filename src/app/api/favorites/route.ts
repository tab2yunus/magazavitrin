import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json([])

    const user = session.user as any
    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: { product: { include: { brand: true, store: true, images: { take: 1 } } } },
    })
    return NextResponse.json(favorites)
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

    const existing = await db.favorite.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    if (existing) return NextResponse.json({ error: 'Already favorited' }, { status: 400 })

    const fav = await db.favorite.create({ data: { userId: user.id, productId } })
    return NextResponse.json(fav, { status: 201 })
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

    await db.favorite.deleteMany({ where: { userId: user.id, productId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
