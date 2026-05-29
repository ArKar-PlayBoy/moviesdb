import type { Metadata } from "next";
import "./globals.css";

import Link from "next/link";
import { Trophy, Home, Calendar, Users, MapPin, Grid3X3, ArrowLeftRight, Goal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import SearchPalette from "@/components/search-palette";
import SearchButton from "@/components/search-button";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
  title: { default: "WorldCup 2026", template: "%s — WorldCup 2026" },
  description: "FIFA World Cup 2026 — Teams, matches, highlights, and schedules for the USA, Canada, Mexico tournament.",
  keywords: ["World Cup 2026", "FIFA", "football", "soccer", "USA 2026", "Canada", "Mexico"],
  authors: [{ name: "WorldCup 2026" }],
  openGraph: {
    title: "WorldCup 2026",
    description: "FIFA World Cup 2026 — Teams, matches, highlights, and schedules.",
    type: "website",
    locale: "en_US",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
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
                    <Trophy className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">WorldCup 2026</span>
                  </Link>
                  <MobileNav />
                  <nav className="hidden md:flex items-center gap-1">
                    <Button variant="ghost" asChild>
                      <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/matches">
                        <Calendar className="h-4 w-4 mr-2" />
                        Matches
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/players">
                        <Users className="h-4 w-4 mr-2" />
                        Players
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/venues">
                        <MapPin className="h-4 w-4 mr-2" />
                        Venues
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/bracket">
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Bracket
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/compare">
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Compare
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/top-scorers">
                        <Goal className="h-4 w-4 mr-2" />
                        Top Scorers
                      </Link>
                    </Button>
                  </nav>
                </div>
                
                <div className="flex items-center gap-1">
                  <SearchButton />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <SearchPalette />

            <div className="container flex-1 px-4 py-6 mx-auto max-w-7xl">
              <main className="w-full">{children}</main>
            </div>
            <Footer />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
