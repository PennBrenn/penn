import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url, slug } = await req.json()

    if (!url || !slug) {
      return NextResponse.json({ error: 'URL and alias are required.' }, { status: 400 })
    }

    // Validate URL
    try { new URL(url) } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await kv.get(`url:${slug}`)
    if (existing) {
      return NextResponse.json({ error: `Alias "/${slug}" is already taken.` }, { status: 409 })
    }

    // Store slug → url
    await kv.set(`url:${slug}`, url)

    // Store metadata for list view
    const meta = { slug, url, createdAt: Date.now() }
    await kv.lpush('links', JSON.stringify(meta))

    return NextResponse.json({ slug, shortUrl: `/${slug}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
