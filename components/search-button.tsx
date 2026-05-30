"use client";

import { Search } from "lucide-react";

export default function SearchButton() {
  return (
    <>
      <button
        onClick={() => document.dispatchEvent(new CustomEvent("opensearch"))}
        className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-background px-1 py-0.5 rounded border border-border ml-2">
          <span>⌘</span>K
        </kbd>
      </button>
      <button
        onClick={() => document.dispatchEvent(new CustomEvent("opensearch"))}
        className="sm:hidden flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </button>
    </>
  );
}
