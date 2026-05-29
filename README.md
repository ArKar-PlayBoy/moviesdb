# WorldCup 2026 ⚽

A FIFA World Cup 2026 fan hub built with Next.js. Browse teams, players, matches, venues, and more for the USA-Canada-Mexico tournament.

## Features

- **Home** — Hero with countdown, quick stats, top scorers preview, Star of the Week, groups at a glance
- **Teams** — All 48 teams across 12 groups with flags, rankings, and confederations
- **Matches** — Group stage and knockout match schedule with scores
- **Players** — 240+ player directory with search, position & group filtering, and Wikipedia photos
- **Bracket** — Knockout bracket with simulated matchups
- **Compare** — Side-by-side team comparison
- **Venues** — All 16 stadiums across 3 host nations
- **Top Scorers** — Goal leaderboard with podium and paginated list
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `SPORTSRC_KEY` | No | SportSRC API key for live match data (only functional after tournament starts) |

## Deployment

Deploy on [Vercel](https://vercel.com/new). Add `SPORTSRC_KEY` to your project environment variables if needed.

## Data

All match results are simulated using a seed-based algorithm weighted by FIFA rankings. Live data from SportSRC activates after the tournament begins (June 11, 2026).
