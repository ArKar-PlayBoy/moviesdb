import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const getUrl = (p: number) => `${baseUrl}${p}`;

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      {currentPage > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={getUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Prev</span>
        </Button>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={getUrl(page)}>{page}</Link>
          </Button>
        )
      )}

      {currentPage < totalPages ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={getUrl(currentPage + 1)}>
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
