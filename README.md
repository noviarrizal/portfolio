# Portfolio

Personal portfolio of Arif Noviarrizal, a frontend engineer in Jakarta working on real-time and fintech interfaces.

Built with Next.js (App Router), TypeScript and Tailwind CSS. The site is fully static.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

```
site.config.ts       name, email, links. Empty links (LinkedIn, Upwork) are not rendered.
content/projects.ts  case studies: summary, stack, links, sections
app/page.tsx         home page
app/work/[slug]/     one page per case study
components/live-market.tsx  the live trade stream in the hero (public Coinbase feed)
components/motion.tsx       the hero sequence and scroll reveals (reduced-motion safe)
app/sitemap.ts, app/robots.ts, app/opengraph-image.tsx   SEO and social previews
```

To add a project, add an entry to `content/projects.ts`. Its page, sitemap entry and metadata are generated from it.

## Configuration

The canonical URL, sitemap and social previews need an absolute site URL. It is taken from `NEXT_PUBLIC_SITE_URL`, then from Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, and falls back to `http://localhost:3000`. Set `NEXT_PUBLIC_SITE_URL` once a custom domain exists.

## The live hero

`components/live-market.tsx` opens one WebSocket to Coinbase Exchange's public feed (no API key). A canvas draws the order flow of the last two minutes of BTC-USD trades: newest at the right edge, one bar per trade, up for a buy and down for a sell, taller for a bigger trade, plus a line for net buying. Price is not plotted because it barely moves at this scale. It starts from the last 1000 real trades (public REST endpoint) so it is full on arrival, then follows the live stream. Three quotes (BTC, ETH, SOL) share the same socket.

Coinbase reports the maker's side on matches, so a "buy" match means the aggressor sold. This was checked against live data (ticker side vs. where the trade printed relative to best bid/ask) rather than assumed, and the code inverts it.

- It draws only while visible, and at one frame a second under `prefers-reduced-motion`, after which it pauses itself. There is always a pause control.
- If the feed can't be reached it says so and links to the full dashboard. It never shows made-up data.
