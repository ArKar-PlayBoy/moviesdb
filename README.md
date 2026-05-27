# Movie App 🎬

A Next.js movie discovery app powered by [TMDB](https://www.themoviedb.org/) (The Movie Database) API. Browse popular and now-playing movies, search for titles, filter by genre, and view detailed information including cast & crew.

## Features

- **Browse** — Popular and now-playing movies on the home page
- **Search** — Find movies by title with live search results
- **Genres** — Filter movies by genre
- **Details** — View movie info, cast, crew, and credits
- **Theme** — Light/dark mode toggle

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- A TMDB API read access token — [get one here](https://www.themoviedb.org/settings/api)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/movie-app.git
   cd movie-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your TMDB token:
   ```env
   TMDB_TOKEN="your-tmdb-api-read-access-token"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com/new). Make sure to add the `TMDB_TOKEN` environment variable in your Vercel project settings.
