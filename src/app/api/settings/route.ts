import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings - Returns settings grouped or flat
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flat = searchParams.get('flat')
    
    if (flat === 'true') {
      // Return flat list for admin
      const settings = await db.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })
      return NextResponse.json(settings)
    }

    const settings = await db.siteSetting.findMany({ orderBy: { group: 'asc' } })
    const result: Record<string, Record<string, string>> = {}
    for (const s of settings) {
      if (!result[s.group]) result[s.group] = {}
      result[s.group][s.key] = s.value || ''
    }
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (Array.isArray(body)) {
      // Update multiple settings with full objects [{id, key, value, type, group}]
      for (const item of body) {
        if (item.id) {
          await db.siteSetting.update({
            where: { id: item.id },
            data: { value: String(item.value ?? '') },
          })
        } else {
          await db.siteSetting.upsert({
            where: { key: item.key },
            update: { value: String(item.value ?? ''), type: item.type || 'text', group: item.group || 'general' },
            create: { key: item.key, value: String(item.value ?? ''), type: item.type || 'text', group: item.group || 'general' },
          })
        }
      }
    } else {
      // Update key-value pairs
      for (const [key, value] of Object.entries(body)) {
        await db.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), type: 'text', group: 'general' },
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/settings - Create a new setting
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const setting = await db.siteSetting.create({ data: body })
    return NextResponse.json(setting, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
