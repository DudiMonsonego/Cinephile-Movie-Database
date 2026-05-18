import { parseReleaseYear } from './fetchMoviesByYear';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const TARGET_COUNT = 30;
const BATCH_SIZE = 10;
const CACHE_TTL_MS = 30 * 60 * 1000;
const SEARCH_TERMS = ['the', 'a', 'new', 'star', 'man', 'love', 'night'];

async function searchMovies(term, year, page) {
  const res = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&type=movie&y=${year}&page=${page}&apikey=${API_KEY}`
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

function ratingValue(movie) {
  const r = parseFloat(movie.imdbRating);
  return Number.isFinite(r) ? r : 0;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem('cinephile-newest');
    if (!raw) return null;
    const { at, movies } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return movies;
  } catch {
    return null;
  }
}

function writeCache(movies) {
  try {
    sessionStorage.setItem(
      'cinephile-newest',
      JSON.stringify({ at: Date.now(), movies })
    );
  } catch {
    /* ignore */
  }
}

/**
 * Loads 30 recent movies (newest release years first, then rating).
 */
export async function fetchNewestMovies() {
  const cached = readCache();
  if (cached?.length) return cached;

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const ids = new Set();

  for (const year of years) {
    for (const term of SEARCH_TERMS) {
      for (let page = 1; page <= 3; page++) {
        try {
          const results = await searchMovies(term, year, page);
          if (results.length === 0) break;
          results.forEach((m) => ids.add(m.imdbID));
          if (ids.size >= 80) break;
        } catch {
          /* skip */
        }
      }
      if (ids.size >= 80) break;
    }
    if (ids.size >= 80) break;
  }

  const movies = [];
  const idList = [...ids];

  for (let i = 0; i < idList.length && movies.length < TARGET_COUNT + 5; i += BATCH_SIZE) {
    const batch = idList.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(batch.map(fetchMovieById));

    for (const movie of details) {
      if (!movie) continue;
      if (movie.Type && movie.Type !== 'movie') continue;
      movies.push(movie);
    }
  }

  movies.sort((a, b) => {
    const yearDiff = parseReleaseYear(b.Year) - parseReleaseYear(a.Year);
    if (yearDiff !== 0) return yearDiff;
    return ratingValue(b) - ratingValue(a);
  });

  const result = movies.slice(0, TARGET_COUNT);
  if (result.length) writeCache(result);
  return result;
}
