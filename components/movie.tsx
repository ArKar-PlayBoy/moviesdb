import { MovieType } from "@/types/global";
import Link from "next/link";

const url = "http://image.tmdb.org/t/p/w185";

export default function Movie({movie}: {movie: MovieType})
{
    const isForeign = movie.original_language && movie.original_language !== "en";

    return (
        <div className="text-center">
            <Link href={`/view/${movie.id}`} className="relative block">
                <img  className="hover:scale-105 transition-all rounded-lg w-full" src={url + movie.poster_path} alt="" />
                {isForeign && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-semibold rounded leading-none">
                        ENG SUB
                    </span>
                )}
            </Link>
            <h3 className="font-bold mt-2 line-clamp-1">{movie.title}</h3>
            <div className="text-muted-foreground text-sm">{movie.release_date?.split("-")[0]}</div>
        </div>
    )
}
