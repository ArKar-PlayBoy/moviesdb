"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title, text }: { title: string; text: string }) {
  async function handleShare() {
    if (typeof navigator === "undefined" || !navigator.share) {
      await navigator.clipboard?.writeText(window.location.href);
      return;
    }
    try {
      await navigator.share({ title, text, url: window.location.href });
    } catch {
      // user cancelled
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Share this page"
    >
      <Share2 className="h-3.5 w-3.5" />
      Share
    </button>
  );
}
