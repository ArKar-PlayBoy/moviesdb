"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useCallback((formData: FormData) => {
    const query = formData.get("query") as string;
    if (query?.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", query);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [pathname, router, searchParams]);

  return (
    <form action={handleSearch} className="flex gap-2">
      <Input 
        name="query"
        placeholder="Search movies..." 
        className="w-64"
        defaultValue={searchParams.get("q") || ""}
      />
      <Button type="submit" variant="secondary">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
