"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Calendar, Users, MapPin, Grid3X3, Info, ArrowLeftRight, Shield, Goal, Trophy } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/players", label: "Players", icon: Users },
  { href: "/top-scorers", label: "Top Scorers", icon: Goal },
  { href: "/venues", label: "Venues", icon: MapPin },
  { href: "/bracket", label: "Bracket", icon: Grid3X3 },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/about", label: "About", icon: Info },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = orig;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => { close(); }, [pathname, close]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-secondary text-foreground hover:bg-secondary/80 active:scale-95 transition-all"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            style={{ animation: "fade-in 0.15s ease-out" }}
            onClick={close}
          />
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-background border-r border-border shadow-2xl overflow-y-auto"
            style={{ animation: "slide-in-left 0.2s ease-out" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={close} className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">WorldCup 2026</span>
                </Link>
                <button onClick={close} className="flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground active:scale-95 transition-transform" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-0.5 p-3">
              {LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary" />
                    )}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                      isActive ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{link.label}</p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-3 pt-2 pb-6">
              <div className="border-t border-border pt-4 px-3">
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                  FIFA World Cup 2026<br />
                  USA · Canada · Mexico
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
