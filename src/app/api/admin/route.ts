import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/dashboard
export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalStores,
      totalBrands,
      totalCategories,
      recentOrders,
      lowStockProducts,
      revenueResult,
      ordersByStatus,
    ] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count({ where: { role: 'customer' } }),
      db.store.count(),
      db.brand.count(),
      db.category.count(),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      db.product.findMany({
        where: { stock: { lt: 10 }, isActive: true },
        take: 10,
        include: { brand: true, store: true },
      }),
      db.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    const totalRevenue = revenueResult._sum.totalAmount || 0

    const statusData: Record<string, number> = {}
    for (const s of ordersByStatus) {
      statusData[s.status] = s._count.status
    }

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalStores,
      totalBrands,
      totalCategories,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      ordersByStatus: statusData,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
