import { MovieType } from "@/types/global";
import Link from "next/link";

const url = "http://image.tmdb.org/t/p/w185";

export default function Movie({movie}: {movie: MovieType})
{
    return (
        <div className="w-46 text-center">
            <Link href={`/view/${movie.id}`}>
                <img  className="hover:scale-105 transition-all rounded-lg" src={url + movie.poster_path} alt="" />
            </Link>
            <h3 className="font-bold mt-2 line-clamp-1">{movie.title}</h3>
            <div className="text-muted-foreground text-sm">{movie.release_date?.split("-")[0]}</div>
        </div>
    )
}
