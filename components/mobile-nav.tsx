"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Calendar, Users, MapPin, Grid3X3, Info, ArrowLeftRight, Shield, BarChart3, Trophy, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/standings", label: "Standings", icon: ListOrdered },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/players", label: "Players", icon: Users },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/bracket", label: "Bracket", icon: Grid3X3 },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/about", label: "About", icon: Info },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="flex sm:flex lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw] p-0 flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Mobile navigation menu with links to all pages</SheetDescription>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
                  <Trophy className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">WorldCup 2026</p>
                  <p className="text-[9px] text-muted-foreground tracking-wider uppercase">FIFA Tournament Hub</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] px-3 pb-1.5 pt-2">Browse</p>
          <div className="space-y-0.5">
            {LINKS.map((link) => {
              const isActive = pathname ? pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)) : false;
              const Icon = link.icon;
              return (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97] ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary" />
                    )}
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${
                      isActive ? "bg-primary/15 text-primary" : "bg-secondary/70 text-muted-foreground"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 truncate">{link.label}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-muted-foreground/30">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        </nav>

        <div className="px-6 pt-3 pb-8">
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-base">🇺🇸</span>
              <span>·</span>
              <span className="text-base">🇨🇦</span>
              <span>·</span>
              <span className="text-base">🇲🇽</span>
              <span className="text-muted-foreground/60 ml-1">3 Host Nations</span>
            </div>
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              FIFA World Cup 2026 · June 11 – July 19<br />
              48 Teams · 104 Matches · 16 Venues
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/30">
              <span>Built with Next.js</span>
              <span>·</span>
              <span>Static Generation</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
