import Movie from "@/components/movie";
import Pagination from "@/components/pagination";
import { MovieType } from "@/types/global";

async function fetchPopular(page: number = 1): Promise<{ movies: MovieType[]; totalPages: number }> {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
      next: { revalidate: 3600 },
    })

    const data = await res.json();
    return { movies: data.results, totalPages: data.total_pages };
}

async function fetchNowPlaying(): Promise<MovieType[]> {
    const res = await fetch("https://api.themoviedb.org/3/movie/now_playing", {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
      next: { revalidate: 3600 },
    })

    const data = await res.json();
    return data.results;
}

async function fetchTopRated(): Promise<MovieType[]> {
    const res = await fetch("https://api.themoviedb.org/3/movie/top_rated", {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
      next: { revalidate: 86400 },
    })

    const data = await res.json();
    return data.results;
}

async function fetchUpcoming(): Promise<MovieType[]> {
    const res = await fetch("https://api.themoviedb.org/3/movie/upcoming", {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
      next: { revalidate: 3600 },
    })

    const data = await res.json();
    return data.results;
}


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ popularPage?: string }>;
}) {
  const { popularPage } = await searchParams;
  const page = Math.max(1, parseInt(popularPage || "1", 10) || 1);

  const [popular, playing, topRated, upcoming] = await Promise.all([
    fetchPopular(page),
    fetchNowPlaying(),
    fetchTopRated(),
    fetchUpcoming(),
  ]);

  return (
    <div>
      <h2 className="py-4 mb-4 border-b text-xl font-bold">Now Playing</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playing.map(movie => {
          return (
            <Movie 
            key={movie.id}
            movie={movie}
            />
          )
        })}
      </div>

      <h2 className="py-4 mb-4 border-b text-xl font-bold">Top Rated</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topRated.map(movie => {
          return (
            <Movie 
            key={movie.id}
            movie={movie}
            />
          )
        })}
      </div>

      <h2 className="py-4 mb-4 border-b text-xl font-bold">Upcoming</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {upcoming.map(movie => {
          return (
            <Movie 
            key={movie.id}
            movie={movie}
            />
          )
        })}
      </div>

      <h2 className="py-4 mb-4 border-b text-xl font-bold">Popular</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {popular.movies.map(movie => {
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
        totalPages={popular.totalPages}
        baseUrl="/?popularPage="
      />
    </div>
  )
}