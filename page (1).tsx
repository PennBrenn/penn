import { kv } from '@vercel/kv'
import { redirect, notFound } from 'next/navigation'

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const url = await kv.get<string>(`url:${params.slug}`)
  if (!url) notFound()
  redirect(url)
}
