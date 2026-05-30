"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="link"
      size="sm"
      onClick={handleShare}
      aria-label="Share this page"
      className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
    >
      <Share2 className="h-3.5 w-3.5" />
      Share
    </Button>
  );
}
