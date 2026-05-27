import type { Metadata } from "next";
import { PersonType, PersonCreditType } from "@/types/global";
import Link from "next/link";
import Pagination from "@/components/pagination";

const profileUrl = "http://image.tmdb.org/t/p/w500";
const thumbUrl = "http://image.tmdb.org/t/p/w185";
const PER_PAGE = 12;

async function fetchPerson(id: string): Promise<PersonType> {
  const res = await fetch(`https://api.themoviedb.org/3/person/${id}?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

async function fetchCredits(id: string): Promise<PersonCreditType[]> {
  const res = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch credits");
  const data = await res.json();
  return data.cast || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const person = await fetchPerson(id);
  return {
    title: `${person.name} — Movie App`,
    description: person.biography?.slice(0, 160) || `View ${person.name}'s movies and biography.`,
  };
}

function formatAge(birthday: string, deathday: string | null): string {
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age.toString();
}

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);

  const [person, credits] = await Promise.all([
    fetchPerson(id),
    fetchCredits(id),
  ]);

  const sorted = [...credits].sort(
    (a, b) => new Date(b.release_date || "0").getTime() - new Date(a.release_date || "0").getTime()
  );

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const paged = sorted.slice(start, start + PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0">
          {person.profile_path ? (
            <img
              src={profileUrl + person.profile_path}
              alt={person.name}
              className="w-64 rounded-lg shadow-2xl border"
            />
          ) : (
            <div className="w-64 h-96 bg-secondary rounded-lg flex items-center justify-center text-6xl">
              ?
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
          <p className="text-muted-foreground mb-6">{person.known_for_department}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-card p-4 rounded-lg border">
            {person.birthday && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Born</p>
                <p className="font-medium">{person.birthday}</p>
                <p className="text-sm text-muted-foreground">Age: {formatAge(person.birthday, person.deathday)}</p>
              </div>
            )}
            {person.deathday && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Died</p>
                <p className="font-medium">{person.deathday}</p>
              </div>
            )}
            {person.place_of_birth && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Place of Birth</p>
                <p className="font-medium">{person.place_of_birth}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Known For</p>
              <p className="font-medium">{person.known_for_department}</p>
            </div>
          </div>

          {person.also_known_as?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Also Known As</p>
              <div className="flex flex-wrap gap-1">
                {person.also_known_as.map((name, i) => (
                  <span key={i} className="px-2 py-1 bg-secondary rounded text-sm">{name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {person.biography && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">Biography</h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {person.biography || "No biography available."}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-3">
          Filmography ({sorted.length} movies)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paged.map((movie) => (
            <Link
              key={`${movie.id}-${movie.character}`}
              href={`/view/${movie.id}`}
              className="block bg-card rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
            >
              {movie.poster_path ? (
                <img
                  src={thumbUrl + movie.poster_path}
                  alt={movie.title}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">No Poster</span>
                </div>
              )}
              <div className="p-3">
                <p className="font-bold text-sm truncate">{movie.title}</p>
                <p className="text-muted-foreground text-xs truncate">{movie.character || "Unknown"}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {movie.release_date?.split("-")[0] || "N/A"}
                  </span>
                  <span className="text-xs text-yellow-500">★ {movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {paged.length === 0 && (
          <p className="text-muted-foreground">No movie credits found.</p>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/person/${id}?page=`}
          />
        )}
      </div>
    </div>
  );
}
