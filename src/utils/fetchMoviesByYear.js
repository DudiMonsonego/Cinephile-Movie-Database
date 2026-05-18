const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const TARGET_COUNT = 50;
const BATCH_SIZE = 10;
const CACHE_TTL_MS = 30 * 60 * 1000;

/** Broad terms help fill a full year listing on OMDb. */
const SEARCH_TERMS = ['the', 'a', 'of', 'love', 'man', 'star', 'night', 'life'];

export function parseReleaseYear(yearStr) {
  if (!yearStr || yearStr === 'N/A') return null;
  const match = String(yearStr).match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

export function isValidBrowseYear(year) {
  const y = parseInt(year, 10);
  const max = new Date().getFullYear() + 1;
  return Number.isInteger(y) && y >= 1900 && y <= max;
}

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

function readCache(year) {
  try {
    const raw = sessionStorage.getItem(`cinephile-year:${year}`);
    if (!raw) return null;
    const { at, movies } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return movies;
  } catch {
    return null;
  }
}

function writeCache(year, movies) {
  try {
    sessionStorage.setItem(
      `cinephile-year:${year}`,
      JSON.stringify({ at: Date.now(), movies })
    );
  } catch {
    /* storage full or disabled */
  }
}

function ratingValue(movie) {
  const r = parseFloat(movie.imdbRating);
  return Number.isFinite(r) ? r : 0;
}

/**
 * Loads up to 50 movies released in the given year (sorted by IMDb rating).
 */
export async function fetchMoviesByYear(year, onProgress) {
  const yearNum = parseInt(year, 10);
  if (!isValidBrowseYear(yearNum)) return [];

  const cached = readCache(yearNum);
  if (cached?.length) {
    onProgress?.(cached.length, cached.length);
    return cached;
  }

  const basicById = new Map();

  for (const term of SEARCH_TERMS) {
    for (let page = 1; page <= 10; page++) {
      try {
        const results = await searchMovies(term, yearNum, page);
        if (results.length === 0) break;

        for (const m of results) {
          if (!basicById.has(m.imdbID)) basicById.set(m.imdbID, m);
        }

        if (basicById.size >= TARGET_COUNT + 10) break;
      } catch {
        /* skip failed search */
      }
    }
    if (basicById.size >= TARGET_COUNT + 10) break;
  }

  const ids = [...basicById.keys()];
  const movies = [];

  for (let i = 0; i < ids.length && movies.length < TARGET_COUNT; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(batch.map(fetchMovieById));

    for (const movie of details) {
      if (!movie) continue;
      if (movie.Type && movie.Type !== 'movie') continue;
      if (parseReleaseYear(movie.Year) !== yearNum) continue;
      movies.push(movie);
    }

    onProgress?.(movies.length, TARGET_COUNT);
  }

  movies.sort((a, b) => ratingValue(b) - ratingValue(a));
  const result = movies.slice(0, TARGET_COUNT);

  if (result.length) writeCache(yearNum, result);
  onProgress?.(result.length, TARGET_COUNT);

  return result;
}
