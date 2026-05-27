export type MovieType = 
{
    id: number;
    backdrop_path: string;
    poster_path: string;
    title: string;
    release_date: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    runtime: number;
    tagline: string;
    genres: { id: number; name: string }[];
    budget: number;
    revenue: number;
    status: string;
    original_language: string;
    production_companies: { name: string }[];
}

export type CastType = {
    id: number;
    name: string;
    character: string;
    profile_path: string;
    order: number;
}