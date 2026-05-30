"use client";

import { useState, useMemo, useEffect, type FC, useRef } from "react";
import Link from "next/link";
import { slugify } from "@/data/worldcup-2026";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import { Search, X, ChevronLeft, ChevronRight, Users, Goal, Shield, Clock, Filter, ArrowUpDown } from "lucide-react";

interface PlayerItem {
  name: string; position: string; age: number;
  teamId: string; teamName: string; teamFlag: string; teamGroup: string;
}

const POSITION_TABS = [
  { key: "All", label: "All", icon: Users, color: "", bg: "" },
  { key: "FW", label: "Forwards", icon: Goal, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  { key: "MF", label: "Midfielders", icon: ArrowUpDown, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "DF", label: "Defenders", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "GK", label: "Goalkeepers", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
];

const PER_PAGE = 24;

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface PlayersContentProps {
  initialPhotos: Record<string, string | null>;
  worldCupSelection?: Set<string>;
}

const PlayersContent: FC<PlayersContentProps> = ({ initialPhotos, worldCupSelection }) => {
  const [allPlayers, setAllPlayers] = useState<PlayerItem[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then(setAllPlayers)
      .catch(() => {});
  }, []);

  const safePlayers = useMemo(() => allPlayers || [], [allPlayers]);

  const selectionFiltered = useMemo(() => {
    if (showAll || !worldCupSelection) return safePlayers;
    return safePlayers.filter(p => worldCupSelection.has(p.name));
  }, [safePlayers, showAll, worldCupSelection]);

  const filtered = useMemo(() => {
    return selectionFiltered.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.teamName.toLowerCase().includes(q)) return false;
      }
      if (positionFilter !== "All" && p.position !== positionFilter) return false;
      if (groupFilter !== "All" && p.teamGroup !== groupFilter) return false;
      return true;
    });
  }, [selectionFiltered, search, positionFilter, groupFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const paginated = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  function onFilter(key: string, value: string) {
    if (key === "search") setSearch(value);
    if (key === "position") setPositionFilter(value);
    if (key === "group") setGroupFilter(value);
    setPage(0);
  }

  useEffect(() => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const activeFilters = [positionFilter !== "All" && positionFilter, groupFilter !== "All" && `Group ${groupFilter}`].filter(Boolean);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{filtered.length}</span> player{filtered.length !== 1 ? "s" : ""}
            {!showAll && worldCupSelection && (
              <span className="text-muted-foreground/60"> · World Cup Selection</span>
            )}
            {activeFilters.length > 0 && (
              <span className="text-muted-foreground/60"> · filtered by {activeFilters.join(", ")}</span>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => onFilter("search", e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => onFilter("search", "")} className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {worldCupSelection && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={showAll ? "outline" : "default"}
            size="sm"
            onClick={() => { setShowAll(false); setSearch(""); setPositionFilter("All"); setGroupFilter("All"); setPage(0); }}
          >
            World Cup Selection
          </Button>
          <Button
            variant={showAll ? "default" : "outline"}
            size="sm"
            onClick={() => { setShowAll(true); setSearch(""); setPositionFilter("All"); setGroupFilter("All"); setPage(0); }}
          >
            All Players ({allPlayers.length})
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {POSITION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = positionFilter === tab.key;
          return (
            <Button
              key={tab.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilter("position", tab.key)}
              className={isActive && tab.key !== "All" ? tab.color : ""}
            >
              <Icon className={`h-4 w-4 ${isActive ? "" : "text-muted-foreground/60"}`} />
              {tab.label}
              {isActive && positionFilter !== "All" && (
                <span className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  positionFilter === "FW" ? "bg-rose-500/20" :
                  positionFilter === "MF" ? "bg-blue-500/20" :
                  positionFilter === "DF" ? "bg-emerald-500/20" :
                  "bg-amber-500/20"
                }`}>
                  {safePlayers.filter(p => p.position === positionFilter).length}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Button
          variant={groupFilter === "All" ? "default" : "outline"}
          size="xs"
          onClick={() => onFilter("group", "All")}
        >
          All
        </Button>
        {GROUPS.map((g) => (
          <Button
            key={g}
            variant={groupFilter === g ? "default" : "outline"}
            size="xs"
            onClick={() => onFilter("group", g)}
          >
            Group {g}
          </Button>
        ))}
      </div>

      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {paginated.map((player, i) => (
          <PlayerCard key={`${player.teamId}-${player.name}`} player={player} photoUrl={initialPhotos[player.name]} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-card mx-auto flex items-center justify-center mb-4 ring-1 ring-border">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">No players found</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button variant="link" onClick={() => { setSearch(""); setPositionFilter("All"); setGroupFilter("All"); }}>
            Clear all filters
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pageNum = totalPages <= 7
                ? i
                : currentPage < 3
                  ? i
                  : currentPage > totalPages - 4
                    ? totalPages - 7 + i
                    : currentPage - 3 + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const POSITION_CARD_STYLES: Record<string, { border: string; gradient: string; badge: string; accent: string }> = {
  FW: { border: "hover:border-rose-500/30", gradient: "from-rose-500/[0.04] to-transparent", badge: "bg-rose-500 text-white", accent: "text-rose-500" },
  MF: { border: "hover:border-blue-500/30", gradient: "from-blue-500/[0.04] to-transparent", badge: "bg-blue-500 text-white", accent: "text-blue-500" },
  DF: { border: "hover:border-emerald-500/30", gradient: "from-emerald-500/[0.04] to-transparent", badge: "bg-emerald-500 text-white", accent: "text-emerald-500" },
  GK: { border: "hover:border-amber-500/30", gradient: "from-amber-500/[0.04] to-transparent", badge: "bg-amber-500 text-white", accent: "text-amber-500" },
};

const POSITION_NAMES: Record<string, string> = {
  FW: "Forward", MF: "Midfielder", DF: "Defender", GK: "Goalkeeper",
};

function PlayerCard({ player, photoUrl, index }: { player: PlayerItem; photoUrl?: string | null; index: number }) {
  const styles = POSITION_CARD_STYLES[player.position] || POSITION_CARD_STYLES.FW;

  return (
    <Link
      href={`/player/${slugify(player.name)}`}
      className={`group relative bg-card rounded-2xl border border-border ${styles.border} transition-all duration-300 overflow-hidden`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative pt-6 pb-2 flex flex-col items-center">
        <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold rounded-md border border-current/20 ${styles.accent} bg-background/80 backdrop-blur-sm z-10`}>
          {player.position}
        </span>

        <div className="relative mb-3">
          <PlayerAvatar name={player.name} photoUrl={photoUrl} size="lg" className="ring-2 ring-border group-hover:ring-primary/40 transition-all duration-300" />
        </div>

        <p className="font-bold text-sm text-center leading-tight px-3 group-hover:text-primary transition-colors truncate max-w-full">
          {player.name}
        </p>

        <div className="flex items-center justify-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
          <span>{player.teamFlag}</span>
          <span className="truncate max-w-[80px]">{player.teamName}</span>
          <span>·</span>
          <span>{player.age}</span>
        </div>
      </div>

      <div className={`relative border-t border-border/50 px-3 py-2 flex items-center justify-between ${styles.accent}`}>
        <span className="text-[10px] font-medium text-muted-foreground">{POSITION_NAMES[player.position] || player.position}</span>
        <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
          Group {player.teamGroup}
        </span>
      </div>

      <div className="absolute -bottom-4 -right-4 text-6xl opacity-[0.03] pointer-events-none select-none group-hover:opacity-[0.06] transition-opacity duration-500">
        {player.teamFlag}
      </div>
    </Link>
  );
}

export default PlayersContent;
