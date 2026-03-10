'use client'

import { useState, useEffect } from 'react'

interface LinkEntry {
  slug: string
  url: string
  createdAt: number
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [links, setLinks] = useState<LinkEntry[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  async function fetchLinks() {
    try {
      const res = await fetch('/api/links')
      const data = await res.json()
      setLinks(data.links || [])
    } catch {}
  }

  async function handleSubmit() {
    if (!url || !alias) {
      setMessage('Both fields are required.')
      setStatus('error')
      return
    }

    const cleanAlias = alias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
    if (!cleanAlias) {
      setMessage('Alias can only contain letters, numbers, hyphens, underscores.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), slug: cleanAlias }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      } else {
        setStatus('success')
        setMessage(`/${cleanAlias}`)
        setUrl('')
        setAlias('')
        fetchLinks()
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Try again.')
    }
  }

  async function handleDelete(slug: string) {
    await fetch(`/api/links?slug=${slug}`, { method: 'DELETE' })
    fetchLinks()
  }

  function copyToClipboard(slug: string) {
    const shortUrl = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(shortUrl)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <main>
      <div className="noise" />

      <div className="container">
        <header>
          <div className="logo-mark">⌘</div>
          <h1>snip<span>.</span></h1>
          <p className="tagline">paste · alias · done</p>
        </header>

        <section className="card form-card">
          <div className="field">
            <label htmlFor="url">Long URL</label>
            <input
              id="url"
              type="url"
              placeholder="https://your-very-long-url.com/that/goes/on/forever"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="field">
            <label htmlFor="alias">
              Alias
              <span className="origin-hint">{origin}/</span>
            </label>
            <input
              id="alias"
              type="text"
              placeholder="my-link"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className={`submit-btn ${status === 'loading' ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="spinner" />
            ) : (
              'Shorten →'
            )}
          </button>

          {message && (
            <div className={`feedback ${status}`}>
              {status === 'success' ? (
                <>
                  <span className="check">✓</span>
                  Created{' '}
                  <strong
                    className="created-link"
                    onClick={() => copyToClipboard(message.replace('/', ''))}
                  >
                    {origin}{message}
                  </strong>
                  <span className="click-hint"> — click to copy</span>
                </>
              ) : (
                message
              )}
            </div>
          )}
        </section>

        {links.length > 0 && (
          <section className="card links-card">
            <h2>Your links <span className="count">{links.length}</span></h2>
            <ul className="links-list">
              {links.map(link => (
                <li key={link.slug} className="link-item">
                  <div className="link-main">
                    <button
                      className={`slug-btn ${copied === link.slug ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(link.slug)}
                      title="Click to copy"
                    >
                      {copied === link.slug ? '✓ copied' : `/${link.slug}`}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dest-url"
                    >
                      {link.url.replace(/^https?:\/\//, '').slice(0, 55)}
                      {link.url.replace(/^https?:\/\//, '').length > 55 ? '…' : ''}
                    </a>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(link.slug)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0c0c0f;
          --surface: #13131a;
          --border: #1f1f2e;
          --accent: #e8ff47;
          --accent-dim: rgba(232,255,71,0.12);
          --text: #f0f0f0;
          --muted: #5a5a72;
          --danger: #ff4d6d;
          --success: #4dff91;
        }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 60px 24px 80px;
        }

        header {
          text-align: center;
          margin-bottom: 48px;
          animation: fadeDown 0.5s ease both;
        }

        .logo-mark {
          font-size: 2rem;
          margin-bottom: 8px;
          color: var(--accent);
          display: block;
        }

        h1 {
          font-size: clamp(3rem, 10vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--text);
        }

        h1 span {
          color: var(--accent);
        }

        .tagline {
          margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--muted);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          animation: fadeUp 0.5s ease both;
        }

        .form-card { animation-delay: 0.1s; }
        .links-card { margin-top: 20px; animation-delay: 0.2s; }

        .field {
          margin-bottom: 16px;
        }

        label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .origin-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--accent);
          opacity: 0.7;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
        }

        input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.88rem;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        input::placeholder { color: var(--muted); }

        input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }

        .submit-btn {
          width: 100%;
          margin-top: 4px;
          padding: 15px;
          background: var(--accent);
          color: #0c0c0f;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
        }

        .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0c0c0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .feedback {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .feedback.success {
          background: rgba(77,255,145,0.08);
          border: 1px solid rgba(77,255,145,0.2);
          color: var(--success);
        }

        .feedback.error {
          background: rgba(255,77,109,0.08);
          border: 1px solid rgba(255,77,109,0.2);
          color: var(--danger);
        }

        .check { margin-right: 6px; }

        .created-link {
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .click-hint {
          opacity: 0.5;
          font-size: 0.75rem;
        }

        h2 {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count {
          background: var(--accent-dim);
          color: var(--accent);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          padding: 2px 7px;
          border-radius: 20px;
          letter-spacing: 0;
        }

        .links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .link-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: border-color 0.15s;
        }

        .link-item:hover { border-color: #2a2a3f; }

        .link-main {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .slug-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--accent);
          background: var(--accent-dim);
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .slug-btn:hover { background: rgba(232,255,71,0.2); }
        .slug-btn.copied { color: var(--success); background: rgba(77,255,145,0.1); }

        .dest-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--muted);
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.15s;
        }

        .dest-url:hover { color: var(--text); }

        .delete-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 4px 6px;
          border-radius: 4px;
          flex-shrink: 0;
          transition: color 0.15s, background 0.15s;
        }

        .delete-btn:hover { color: var(--danger); background: rgba(255,77,109,0.08); }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .link-main { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  )
}
