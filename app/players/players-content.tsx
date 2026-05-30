"use client";

import { useState, useMemo, type FC, useRef, useEffect } from "react";
import Link from "next/link";
import { slugify, GROUPS, type PlayerWithTeam } from "@/data/worldcup-2026";
import PlayerAvatar from "@/components/player-avatar";
import { Search, X, ChevronLeft, ChevronRight, Users, Goal, Shield, Clock, Filter, ArrowUpDown } from "lucide-react";

const POSITION_TABS = [
  { key: "All", label: "All", icon: Users, color: "", bg: "" },
  { key: "FW", label: "Forwards", icon: Goal, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40" },
  { key: "MF", label: "Midfielders", icon: ArrowUpDown, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40" },
  { key: "DF", label: "Defenders", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40" },
  { key: "GK", label: "Goalkeepers", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40" },
];

const PER_PAGE = 24;

interface PlayersContentProps {
  allPlayers: PlayerWithTeam[];
  initialPhotos: Record<string, string | null>;
}

const PlayersContent: FC<PlayersContentProps> = ({ allPlayers, initialPhotos }) => {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return allPlayers.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.teamName.toLowerCase().includes(q)) return false;
      }
      if (positionFilter !== "All" && p.position !== positionFilter) return false;
      if (groupFilter !== "All" && p.teamGroup !== groupFilter) return false;
      return true;
    });
  }, [allPlayers, search, positionFilter, groupFilter]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{filtered.length}</span> player{filtered.length !== 1 ? "s" : ""}
            {activeFilters.length > 0 && (
              <span className="text-muted-foreground/60"> · filtered by {activeFilters.join(", ")}</span>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => onFilter("search", e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          {search && (
            <button onClick={() => onFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Position filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {POSITION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = positionFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilter("position", tab.key)}
              className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                isActive
                  ? `${tab.bg || "bg-primary text-primary-foreground border-primary"} ${tab.color || "text-primary-foreground"} shadow-sm`
                  : "bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "" : "text-muted-foreground/60 group-hover:text-foreground/80"}`} />
              {tab.label}
              {isActive && positionFilter !== "All" && (
                <span className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  positionFilter === "FW" ? "bg-rose-500/20" :
                  positionFilter === "MF" ? "bg-blue-500/20" :
                  positionFilter === "DF" ? "bg-emerald-500/20" :
                  "bg-amber-500/20"
                }`}>
                  {allPlayers.filter(p => p.position === positionFilter).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Group filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <button
          onClick={() => onFilter("group", "All")}
          className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            groupFilter === "All"
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-muted-foreground border-border hover:border-foreground/30"
          }`}
        >
          All
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => onFilter("group", g)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              groupFilter === g
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            Group {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {paginated.map((player, i) => (
          <PlayerCard key={`${player.teamId}-${player.name}`} player={player} photoUrl={initialPhotos[player.name]} index={i} />
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-card mx-auto flex items-center justify-center mb-4 ring-1 ring-border">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">No players found</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearch(""); setPositionFilter("All"); setGroupFilter("All"); }}
            className="text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-4 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum = totalPages <= 7
                ? i
                : currentPage < 3
                  ? i
                  : currentPage > totalPages - 4
                    ? totalPages - 7 + i
                    : currentPage - 3 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    pageNum === currentPage
                      ? "bg-foreground text-background shadow-md"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 px-4 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
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

function PlayerCard({ player, photoUrl, index }: { player: PlayerWithTeam; photoUrl?: string | null; index: number }) {
  const styles = POSITION_CARD_STYLES[player.position] || POSITION_CARD_STYLES.FW;
  const initials = player.name.split(" ").map(n => n[0]).join("");

  return (
    <Link
      href={`/player/${slugify(player.name)}`}
      className={`group relative bg-card rounded-2xl border border-border ${styles.border} transition-all duration-300 overflow-hidden`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Position gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Top section with avatar */}
      <div className="relative pt-6 pb-2 flex flex-col items-center">
        {/* Position badge */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold rounded-md border border-current/20 ${styles.accent} bg-background/80 backdrop-blur-sm z-10`}>
          {player.position}
        </span>

        {/* Avatar with ring */}
        <div className="relative mb-3">
          <div className={`absolute -inset-2 rounded-full bg-gradient-to-br from-${player.position === "FW" ? "rose" : player.position === "MF" ? "blue" : player.position === "DF" ? "emerald" : "amber"}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg`} />
          <PlayerAvatar name={player.name} photoUrl={photoUrl} size="lg" className="ring-2 ring-border group-hover:ring-primary/40 transition-all duration-300" />
        </div>

        {/* Name */}
        <p className="font-bold text-sm text-center leading-tight px-3 group-hover:text-primary transition-colors truncate max-w-full">
          {player.name}
        </p>

        {/* Team + age */}
        <div className="flex items-center justify-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
          <span>{player.teamFlag}</span>
          <span className="truncate max-w-[80px]">{player.teamName}</span>
          <span>·</span>
          <span>{player.age}</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`relative border-t border-border/50 px-3 py-2 flex items-center justify-between ${styles.accent}`}>
        <span className="text-[10px] font-medium text-muted-foreground">{POSITION_NAMES[player.position] || player.position}</span>
        <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity">
          Group {player.teamGroup}
        </span>
      </div>

      {/* Team flag watermark */}
      <div className="absolute -bottom-4 -right-4 text-6xl opacity-[0.03] pointer-events-none select-none group-hover:opacity-[0.06] transition-opacity duration-500">
        {player.teamFlag}
      </div>
    </Link>
  );
}

export default PlayersContent;
