import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const customers = await db.user.findMany({
      where: { role: 'customer' },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(customers)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
