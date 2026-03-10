# snip. — URL Shortener

A minimal URL shortener built with Next.js 14 + Vercel KV.
Paste a URL, set an alias, done.

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create snip --public --push
```

### 2. Import on Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import your repo
- Click **Deploy** (no env vars needed yet)

### 3. Add Vercel KV
- In your Vercel project → **Storage** tab → **Create KV Database**
- Name it anything (e.g. `snip-kv`)
- Click **Connect** — Vercel auto-injects the env vars

### 4. Redeploy
- Trigger a redeploy from the Vercel dashboard or push any commit

That's it! Your shortener is live.

## Local Development

```bash
npm install

# Copy env example and fill in values from Vercel KV dashboard
cp .env.local.example .env.local

npm run dev
```

## Project Structure

```
app/
  page.tsx              # Homepage UI
  layout.tsx            # Root layout
  [slug]/page.tsx       # Redirect handler
  api/
    shorten/route.ts    # POST: create short link
    links/route.ts      # GET: list links, DELETE: remove link
```
