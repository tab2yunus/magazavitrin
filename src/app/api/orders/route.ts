import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/orders - List orders (admin: all, customer: own)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    const { searchParams } = new URL(request.url)
    
    let where: any = {}
    if (user.role === 'customer') {
      where.userId = user.id
    }
    
    const status = searchParams.get('status')
    if (status) where.status = status

    const orders = await db.order.findMany({
      where,
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/orders - Create order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })

    const user = session.user as any
    const body = await request.json()

    // Get cart items
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Sepetiniz boş' }, { status: 400 })
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.normalPrice
      return sum + price * item.quantity
    }, 0)

    const shippingCost = subtotal > 200 ? 0 : 29.99
    const discountAmount = body.discountAmount || 0
    const totalAmount = subtotal - discountAmount + shippingCost

    const orderNumber = `MV${Date.now().toString().slice(-10)}`

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'pending',
        paymentMethod: body.paymentMethod || 'cod',
        paymentStatus: body.paymentMethod === 'demo_payment' ? 'paid' : 'pending',
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        shippingAddress: body.shippingAddress,
        billingAddress: body.billingAddress,
        notes: body.notes,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.discountPrice || item.product.normalPrice,
            totalPrice: (item.product.discountPrice || item.product.normalPrice) * item.quantity,
            variationId: item.variationId,
          })),
        },
      },
      include: { items: true },
    })

    // Clear cart
    await db.cartItem.deleteMany({ where: { cartId: cart.id } })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
