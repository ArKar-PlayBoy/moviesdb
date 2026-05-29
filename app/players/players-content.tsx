"use client";

import { useState, useMemo, type FC } from "react";
import Link from "next/link";
import { slugify, GROUPS, type PlayerWithTeam } from "@/data/worldcup-2026";
import PlayerAvatar from "@/components/player-avatar";
import { Search, X, ChevronLeft, ChevronRight, Users } from "lucide-react";

const POSITION_TABS = [
  { key: "All", label: "All", color: "" },
  { key: "FW", label: "Forwards", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { key: "MF", label: "Midfielders", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { key: "DF", label: "Defenders", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { key: "GK", label: "Goalkeepers", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} players found</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => onFilter("search", e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button onClick={() => onFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {POSITION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilter("position", tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              positionFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => onFilter("group", "All")}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
            groupFilter === "All"
              ? "bg-secondary text-foreground border-border"
              : "bg-card text-muted-foreground border-border hover:border-primary"
          }`}
        >
          All Groups
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => onFilter("group", g)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
              groupFilter === g
                ? "bg-secondary text-foreground border-border"
                : "bg-card text-muted-foreground border-border hover:border-primary"
            }`}
          >
            Group {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {paginated.map((player) => (
          <PlayerCard key={`${player.teamId}-${player.name}`} player={player} photoUrl={initialPhotos[player.name]} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No players match your filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
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
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-muted-foreground"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const POSITION_STYLES: Record<string, string> = {
  FW: "bg-red-500/10 text-red-500 border-red-500/20",
  MF: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DF: "bg-green-500/10 text-green-500 border-green-500/20",
  GK: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

function PlayerCard({ player, photoUrl }: { player: PlayerWithTeam; photoUrl?: string | null }) {
  const posStyle = POSITION_STYLES[player.position] || "bg-secondary text-muted-foreground border-border";
  return (
    <Link
      href={`/player/${slugify(player.name)}`}
      className="group block bg-card rounded-xl border border-border hover:ring-2 hover:ring-primary/70 transition-all overflow-hidden"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-card to-secondary/50 flex items-center justify-center relative">
        <PlayerAvatar name={player.name} photoUrl={photoUrl} size="lg" />
        <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md border ${posStyle}`}>
          {player.position}
        </span>
      </div>
      <div className="p-3">
        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{player.name}</p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <span>{player.teamFlag}</span>
          <span className="truncate">{player.teamName}</span>
          <span>·</span>
          <span>{player.age}</span>
        </div>
      </div>
    </Link>
  );
}

export default PlayersContent;
