import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: any = {}
    if (status) where.status = status

    const orders = await db.order.findMany({
      where,
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        user: { select: { name: true, email: true, phone: true } },
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get order counts by status for tabs
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const counts: Record<string, number> = {}
    for (const sc of statusCounts) {
      counts[sc.status] = sc._count.status
    }

    return NextResponse.json({ orders, statusCounts: counts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
