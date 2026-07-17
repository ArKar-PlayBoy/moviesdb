# WorldCup 2026 ⚽

A FIFA World Cup 2026 fan hub built with Next.js. Browse teams, players, matches, venues, and more for the USA-Canada-Mexico tournament.

## Features

- **Home** — Hero with countdown, quick stats, top scorers preview, Star of the Week, groups at a glance
- **Teams** — All 48 teams across 12 groups with flags, rankings, and confederations
- **Matches** — Group stage and knockout match schedule with live scores
- **Players** — 240+ player directory with search, position & group filtering, and Wikipedia photos
- **Bracket** — Knockout bracket with real match results
- **Compare** — Side-by-side team comparison
- **Venues** — All 16 stadiums across 3 host nations
- **Top Scorers** — Goal leaderboard with podium and paginated list
- **Stats** — Goals, assists, and cards leaderboards
- **Search** — Command palette (Cmd+K) to search players and teams
- **Theme** — Light/dark mode toggle

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)

## Getting Started

```bash
npm install
# Fetch latest FIFA data (group + knockout matches)
npm run sync
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `npm run sync` anytime to refresh data from the FIFA API.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | For Vercel | Upstash Redis URL to share data across serverless functions |
| `CRON_SECRET` | For Vercel | Secret key for cron authentication |
| `SPORTSRC_KEY` | No | SportSRC API key (score fallback; FIFA API is primary) |

## Data Pipeline

- **Local**: `npm run sync` fetches all match results from the FIFA API and writes to `data/live-results.json`. The dev server reads from this file.
- **Production**: A Vercel cron runs `/api/cron/sync-matches` every 30 minutes, writing to Redis. Pages read from Redis.

## Deployment

Deploy on [Vercel](https://vercel.com/new). Add `REDIS_URL`, `CRON_SECRET`, and optionally `SPORTSRC_KEY` to your project environment variables. The cron is configured in `vercel.json`.
