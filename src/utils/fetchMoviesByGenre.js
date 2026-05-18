import { getGenreQueries } from './genreConfig';
import { parseReleaseYear } from './fetchMoviesByYear';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const TARGET_COUNT = 50;
const BATCH_SIZE = 10;
const CACHE_TTL_MS = 30 * 60 * 1000;

async function searchMovies(term, page) {
  const res = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&type=movie&page=${page}&apikey=${API_KEY}`
  );
  const data = await res.json();
  if (data.Response !== 'True' || !data.Search) return [];
  return data.Search;
}

async function fetchMovieById(imdbID) {
  const res = await fetch(
    `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
  );
  const data = await res.json();
  return data.Response === 'True' ? data : null;
}

function movieHasGenre(movie, genre) {
  if (!movie?.Genre || movie.Genre === 'N/A') return false;
  return movie.Genre.split(',').map((g) => g.trim()).includes(genre);
}

function readCache(genre) {
  try {
    const raw = sessionStorage.getItem(`cinephile-genre:${genre}`);
    if (!raw) return null;
    const { at, movies } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return movies;
  } catch {
    return null;
  }
}

function writeCache(genre, movies) {
  try {
    sessionStorage.setItem(
      `cinephile-genre:${genre}`,
      JSON.stringify({ at: Date.now(), movies })
    );
  } catch {
    /* ignore */
  }
}

/**
 * Loads up to 50 movies for a genre (newest releases first).
 */
export async function fetchMoviesByGenre(genre, onProgress) {
  const cached = readCache(genre);
  if (cached?.length) {
    onProgress?.(cached.length, cached.length);
    return cached;
  }

  const queries = getGenreQueries(genre);
  const ids = new Set();

  for (const term of queries) {
    for (let page = 1; page <= 5; page++) {
      try {
        const results = await searchMovies(term, page);
        if (results.length === 0) break;
        results.forEach((m) => ids.add(m.imdbID));
        if (ids.size >= 120) break;
      } catch {
        /* skip */
      }
    }
    if (ids.size >= 120) break;
  }

  const movies = [];
  const idList = [...ids];

  for (let i = 0; i < idList.length && movies.length < TARGET_COUNT; i += BATCH_SIZE) {
    const batch = idList.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(batch.map(fetchMovieById));

    for (const movie of details) {
      if (!movie || !movieHasGenre(movie, genre)) continue;
      if (movie.Type && movie.Type !== 'movie') continue;
      movies.push(movie);
    }

    onProgress?.(movies.length, TARGET_COUNT);
  }

  movies.sort((a, b) => parseReleaseYear(b.Year) - parseReleaseYear(a.Year));
  const result = movies.slice(0, TARGET_COUNT);

  if (result.length) writeCache(genre, result);
  onProgress?.(result.length, TARGET_COUNT);

  return result;
}
