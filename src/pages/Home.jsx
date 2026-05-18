import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import SortControls from '../components/SortControls';
import { useDebounce } from '../hooks/useDebounce';
import styles from './Home.module.css';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

function sortMovies(movies, sortBy) {
  const arr = [...movies];
  switch (sortBy) {
    case 'title-asc':
      return arr.sort((a, b) => a.Title.localeCompare(b.Title));
    case 'title-desc':
      return arr.sort((a, b) => b.Title.localeCompare(a.Title));
    case 'year-desc':
      return arr.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    case 'year-asc':
      return arr.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    case 'rating-desc':
      return arr.sort(
        (a, b) =>
          parseFloat(b.imdbRating === 'N/A' ? 0 : b.imdbRating) -
          parseFloat(a.imdbRating === 'N/A' ? 0 : a.imdbRating)
      );
    case 'rating-asc':
      return arr.sort(
        (a, b) =>
          parseFloat(a.imdbRating === 'N/A' ? 0 : a.imdbRating) -
          parseFloat(b.imdbRating === 'N/A' ? 0 : b.imdbRating)
      );
    default:
      return arr;
  }
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const debouncedQuery = useDebounce(query, 450);
  const trimmedQuery = debouncedQuery.trim();

  const fetchMovies = useCallback(
    async (searchQuery, pageNum, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');

      try {
        const searchRes = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&page=${pageNum}&apikey=${API_KEY}`
        );
        const searchData = await searchRes.json();

        if (searchData.Response === 'False') {
          // Don't wipe the existing results — the user is still typing.
          // Only update state on "load more" failures (append = false for page 1).
          if (append) return;

          if (searchData.Error === 'Too many results.') {
            // Too broad: clear results and tell the user to narrow down.
            setMovies([]);
            setTotalResults(0);
            setError('Too many results — try a more specific title.');
          }
          // "Movie not found!" for mid-typing states: just silently keep
          // the previous results visible — don't clear or show an error.
          return;
        }

        const total = parseInt(searchData.totalResults, 10) || 0;
        setTotalResults(total);

        const basicMovies = searchData.Search || [];

        // Fetch full details (including rating) for each result in parallel
        const detailPromises = basicMovies.map((m) =>
          fetch(`https://www.omdbapi.com/?i=${m.imdbID}&apikey=${API_KEY}`)
            .then((r) => r.json())
            .catch(() => m)
        );
        const detailed = await Promise.all(detailPromises);
        const enriched = detailed.map((d, i) =>
          d.Response === 'True' ? d : basicMovies[i]
        );

        setMovies((prev) => (append ? [...prev, ...enriched] : enriched));
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Only fetch when the user has typed something
  useEffect(() => {
    if (!trimmedQuery) {
      setMovies([]);
      setTotalResults(0);
      setError('');
      return;
    }
    setPage(1);
    fetchMovies(trimmedQuery, 1, false);
  }, [trimmedQuery, fetchMovies]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(trimmedQuery, nextPage, true);
  };

  const hasMore = movies.length < totalResults;
  const sorted = sortMovies(movies, sortBy);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.heroEyebrow}>🎬 Powered by OMDb</span>
        <h1 className={styles.heroTitle}>
          Discover <span className={styles.accent}>Movies</span>
        </h1>
        <p className={styles.heroSub}>
          Search millions of titles — find your next obsession
        </p>
        <SearchBar value={query} onChange={setQuery} />
      </section>

      {!loading && !error && movies.length > 0 && (
        <div className={styles.controls}>
          <SortControls
            value={sortBy}
            onChange={setSortBy}
            total={totalResults}
          />
        </div>
      )}

      <section className={styles.gridSection}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎭</span>
            <p className={styles.emptyTitle}>No results found</p>
            <p className={styles.emptyText}>{error}</p>
          </div>
        ) : !trimmedQuery ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeGrid}>
              {['🎬', '🎭', '🍿', '🎞️', '⭐', '🎥'].map((emoji) => (
                <span key={emoji} className={styles.welcomeEmoji}>{emoji}</span>
              ))}
            </div>
            <p className={styles.welcomeTitle}>What are you watching tonight?</p>
            <p className={styles.welcomeText}>
              Search for any movie, TV show, or series above to get started
            </p>
          </div>
        ) : movies.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyTitle}>Start searching</p>
            <p className={styles.emptyText}>Type a movie title above</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {sorted.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <button
                  className={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className={styles.spinner} />
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}

            {loadingMore && (
              <div className={styles.grid} style={{ marginTop: '1.5rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
