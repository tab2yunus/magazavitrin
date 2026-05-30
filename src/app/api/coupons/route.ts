import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(coupons)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const coupon = await db.coupon.create({ data: body })
    return NextResponse.json(coupon, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
