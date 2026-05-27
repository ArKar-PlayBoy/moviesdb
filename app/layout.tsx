import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Link from "next/link";
import { Clapperboard, Play, Search, Home, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie App",
  description: "Browse movies with TMDB",
};

async function fetchGenres(): Promise<{id: string; name: string}[]> {
    const res = await fetch("https://api.themoviedb.org/3/genre/movie/list", {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`
      },
    });

    const data = await res.json();
    return data.genres;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
      const genres = await fetchGenres();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center gap-2">
                    <Clapperboard className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">MovieApp</span>
                  </Link>
                  <nav className="hidden md:flex items-center gap-1">
                    <Button variant="ghost" asChild>
                      <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/search">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Link>
                    </Button>
                  </nav>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="secondary" asChild>
                    <Link href="/search">
                      <Search className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Search</span>
                    </Link>
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 px-4 py-6">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                <div className="h-full py-6 pr-6">
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">GENRES</h3>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/">
                        <Film className="mr-2 h-4 w-4" />
                        All Movies
                      </Link>
                    </Button>
                    {genres.map(genre => (
                      <Button
                        key={genre.id}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/genre/${genre.name}/${genre.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          {genre.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </aside>
              
              <main className="relative w-full">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
