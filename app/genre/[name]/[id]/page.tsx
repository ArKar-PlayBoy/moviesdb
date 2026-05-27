import Movie from "@/components/movie";
import Pagination from "@/components/pagination";
import { MovieType } from "@/types/global";


async function fetchGenre(id: string, page: number = 1): Promise<{ movies: MovieType[]; totalPages: number }> {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
      next: { revalidate: 3600 },
    })

    const data = await res.json();
    return { movies: data.results, totalPages: data.total_pages };
}


export default async function Genre({ params, searchParams,
}:{ 
  params: Promise<{id: string; name: string}>;
  searchParams: Promise<{ page?: string }>;
}) {
  const {id, name} = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1);

  const { movies, totalPages } = await fetchGenre(id, page);
  return (
    <div>
      <h2 className="py-4 mb-4 border-b text-xl font-bold">{name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map(movie => {
          return (
            <Movie 
            key={movie.id}
            movie={movie}
            />
          )
        })}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl={`/genre/${name}/${id}?page=`}
      />
    </div>
  )
}