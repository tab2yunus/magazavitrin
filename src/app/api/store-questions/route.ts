import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const where: any = {}
    if (storeId) where.storeId = storeId

    const questions = await db.storeQuestion.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(questions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as any
    const { storeId, question } = await request.json()
    const user = session?.user as any

    const q = await db.storeQuestion.create({
      data: { storeId, question, userId: user?.id || null, isAnswered: false },
    })
    return NextResponse.json(q, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answer } = await request.json()
    const q = await db.storeQuestion.update({
      where: { id },
      data: { answer, isAnswered: true },
    })
    return NextResponse.json(q)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
