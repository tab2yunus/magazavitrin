import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/cart - Get current user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ items: [] })

    const user = session.user as any
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { include: { brand: true, store: true, images: { take: 1, orderBy: { sortOrder: 'asc' } }, variations: true } },
          },
        },
      },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: { include: { brand: true, store: true, images: { take: 1 }, variations: true } } } } },
      })
    }

    return NextResponse.json(cart)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })

    const user = session.user as any
    const { productId, quantity, variationId } = await request.json()

    let cart = await db.cart.findUnique({ where: { userId: user.id } })
    if (!cart) {
      cart = await db.cart.create({ data: { userId: user.id } })
    }

    // Check if item already exists
    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId, variationId: variationId || null },
    })

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await db.cartItem.create({
        data: { cartId: cart.id, productId, quantity, variationId: variationId || null },
      })
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { brand: true, store: true, images: { take: 1 } } } } } },
    })

    return NextResponse.json(updatedCart)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { itemId, quantity } = await request.json()
    
    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } })
    } else {
      await db.cartItem.update({ where: { id: itemId }, data: { quantity } })
    }

    const user = session.user as any
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { brand: true, store: true, images: { take: 1 } } } } } },
    })

    return NextResponse.json(cart)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { itemId } = await request.json()
    
    if (itemId) {
      await db.cartItem.delete({ where: { id: itemId } })
    } else {
      // Clear entire cart
      const user = session.user as any
      const cart = await db.cart.findUnique({ where: { userId: user.id } })
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    }

    const user = session.user as any
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { brand: true, store: true, images: { take: 1 } } } } } },
    })

    return NextResponse.json(cart)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
