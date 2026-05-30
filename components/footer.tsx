import Link from "next/link";
import { Trophy } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold">WorldCup 2026</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              FIFA World Cup 2026 — hosted across USA, Canada & Mexico.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tournament</p>
            <div className="flex flex-col gap-1.5">
              <Link href="/matches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Matches</Link>
              <Link href="/bracket" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bracket</Link>
              <Link href="/venues" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Venues</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Teams</p>
            <div className="flex flex-col gap-1.5">
              <Link href="/players" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Players</Link>
              <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Info</p>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">48 teams · 104 matches</span>
              <span className="text-sm text-muted-foreground">16 venues · 3 countries</span>
              <span className="text-sm text-muted-foreground">June 11 — July 19</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>FIFA World Cup 2026 — unofficial fan hub. Not affiliated with FIFA.</span>
          <span>Developed by <span className="font-semibold text-foreground">Ar Kar Moe Myint</span></span>
        </div>
      </div>
    </footer>
  );
}
