import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code) return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })

    const coupon = await db.coupon.findUnique({ where: { code } })
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Geçersiz kupon kodu' }, { status: 404 })
    }

    const now = new Date()
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json({ error: 'Kupon henüz başlamadı' }, { status: 400 })
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json({ error: 'Kupon süresi doldu' }, { status: 400 })
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Kupon kullanım limiti doldu' }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true, 
      coupon,
      discount: coupon.type === 'percentage' ? coupon.value : coupon.value,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
