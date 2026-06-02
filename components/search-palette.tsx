"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Trophy } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchResult {
  type: "player" | "team";
  label: string;
  href: string;
  subtitle: string;
}

export default function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpen() { setOpen(true); }
    document.addEventListener("keydown", down);
    document.addEventListener("opensearch", onOpen);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("opensearch", onOpen);
    };
  }, []);

  const doSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results || []);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(""); setResults([]); } }}>
      <CommandInput
        placeholder="Search players and teams..."
        value={query}
        onValueChange={doSearch}
      />
      <CommandList>
        <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((r) => (
              <CommandItem
                key={`${r.type}-${r.label}`}
                value={`${r.type}-${r.label}`}
                onSelect={() => {
                  setOpen(false);
                  router.push(r.href);
                }}
                className="flex items-center gap-3"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  {r.type === "player" ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : (
                    <Trophy className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{r.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[10px] uppercase text-muted-foreground font-medium">{r.type}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
