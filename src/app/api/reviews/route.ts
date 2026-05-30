import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await db.review.findMany({
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    const { productId, rating, title, comment } = await request.json()

    const review = await db.review.create({
      data: { userId: user.id, productId, rating, title, comment, isActive: true },
    })
    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
