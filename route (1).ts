import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const raw = await kv.lrange('links', 0, -1)
    const links = raw
      .map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)

    return NextResponse.json({ links })
  } catch {
    return NextResponse.json({ links: [] })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'No slug provided.' }, { status: 400 })

    // Remove the KV key
    await kv.del(`url:${slug}`)

    // Remove from the list
    const raw = await kv.lrange('links', 0, -1)
    const remaining = raw.filter(item => {
      try {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item
        return parsed.slug !== slug
      } catch { return true }
    })

    await kv.del('links')
    if (remaining.length > 0) {
      await kv.rpush('links', ...remaining)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
