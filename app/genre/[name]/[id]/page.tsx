import Movie from "@/components/movie";
import { MovieType } from "@/types/global";


async function fetchGenre(id: string): Promise<MovieType[]> {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    })

    const data = await res.json();
    return data.results;
}


export default async function Genre({ params,
}:{ 
  params: Promise<{id: string; name: string}>;
}) {
  const {id, name} = await params;
  const movies = await fetchGenre(id);
  return (
    <div>
      <h2 className="py-4 mb-4 border-b text-xl font-bold">{name}</h2>
      <div className="flex flex-wrap gap-3">
        {movies.map(movie => {
          return (
            <Movie 
            key={movie.id}
            movie={movie}
            />
          )
        })}
      </div>

     
    </div>
  )
}