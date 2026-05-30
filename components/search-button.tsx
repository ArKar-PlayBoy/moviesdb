"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchButton() {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.dispatchEvent(new CustomEvent("opensearch"))}
        className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="flex items-center gap-0.5 text-[10px] bg-background px-1 py-0.5 rounded border ml-1">
          <span>⌘</span>K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.dispatchEvent(new CustomEvent("opensearch"))}
        className="sm:hidden"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  );
}
