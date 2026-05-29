import Link from "next/link";
import { Trophy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-5xl font-black mb-2">404</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        This page doesn&apos;t exist. The tournament hasn&apos;t started yet, so maybe this match or player hasn&apos;t been added.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
