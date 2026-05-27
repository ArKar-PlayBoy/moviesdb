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
    production_countries: { iso_3166_1: string; name: string }[];
}

export type CastType = {
    id: number;
    name: string;
    character: string;
    profile_path: string;
    order: number;
}

export type PersonType = {
    id: number;
    name: string;
    biography: string;
    birthday: string;
    deathday: string | null;
    place_of_birth: string;
    profile_path: string;
    known_for_department: string;
    also_known_as: string[];
    gender: number;
}

export type PersonCreditType = {
    id: number;
    title: string;
    character: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
}

export type VideoType = {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}