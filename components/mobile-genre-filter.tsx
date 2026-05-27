"use client";

import { useRouter, usePathname } from "next/navigation";

export default function MobileGenreFilter({
  genres,
}: {
  genres: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (val === "/") {
      router.push("/");
    } else {
      router.push(val);
    }
  };

  return (
    <div className="md:hidden mb-4">
      <select
        onChange={handleChange}
        className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
        defaultValue=""
      >
        <option value="" disabled>Select genre...</option>
        <option value="/">All Movies</option>
        {genres.map((g) => (
          <option key={g.id} value={`/genre/${g.name}/${g.id}`}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}
