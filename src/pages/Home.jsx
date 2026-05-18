import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import BrowseFilters from '../components/BrowseFilters';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import SortControls from '../components/SortControls';
import { useDebounce } from '../hooks/useDebounce';
import { sortMovies } from '../utils/sortMovies';
import { OMDB_GENRES } from '../utils/genreConfig';
import { fetchMoviesByGenre } from '../utils/fetchMoviesByGenre';
import { fetchMoviesByYear, isValidBrowseYear } from '../utils/fetchMoviesByYear';
import { fetchNewestMovies } from '../utils/fetchNewestMovies';
import styles from './Home.module.css';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('year-desc');

  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState('');

  const [browseGenre, setBrowseGenre] = useState('');
  const [browseYear, setBrowseYear] = useState('');
  const [browseMode, setBrowseMode] = useState(null);
  const [browseLabel, setBrowseLabel] = useState('');

  const browseAbort = useRef(null);
  const urlBrowseHandled = useRef(false);

  const debouncedQuery = useDebounce(query, 450);
  const trimmedQuery = debouncedQuery.trim();
  const isIdle = !trimmedQuery && browseMode === null;
  const isSearchMode = !isIdle && browseMode === null && trimmedQuery.length > 0;
  const isBrowseMode = browseMode === 'genre' || browseMode === 'year';

  const displayMovies = isIdle ? featured : movies;
  const displayLoading = isIdle ? featuredLoading : loading;
  const displayError = isIdle ? featuredError : error;
  const displayTotal = isIdle ? featured.length : isBrowseMode ? movies.length : totalResults;

  useEffect(() => {
    let cancelled = false;
    setFeaturedLoading(true);
    setFeaturedError('');

    fetchNewestMovies()
      .then((results) => {
        if (cancelled) return;
        if (results.length === 0) {
          setFeaturedError('Could not load latest movies.');
        } else {
          setFeatured(results);
        }
      })
      .catch(() => {
        if (!cancelled) setFeaturedError('Could not load latest movies.');
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
          if (append) return;

          if (searchData.Error === 'Too many results.') {
            setMovies([]);
            setTotalResults(0);
            setError('Too many results — try a more specific title.');
          }
          return;
        }

        const total = parseInt(searchData.totalResults, 10) || 0;
        setTotalResults(total);

        const basicMovies = searchData.Search || [];

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

  function clearBrowse() {
    setBrowseMode(null);
    setBrowseLabel('');
  }

  function handleQueryChange(value) {
    setQuery(value);
    if (value.trim()) {
      clearBrowse();
      setBrowseGenre('');
      setBrowseYear('');
    }
  }

  async function runBrowse(mode, label, fetcher) {
    browseAbort.current?.abort();
    const controller = new AbortController();
    browseAbort.current = controller;

    setQuery('');
    setBrowseMode(mode);
    setBrowseLabel(label);
    setMovies([]);
    setTotalResults(0);
    setError('');
    setLoading(true);
    setPage(1);
    setSortBy(mode === 'year' ? 'rating-desc' : 'year-desc');

    try {
      const results = await fetcher();
      if (controller.signal.aborted) return;

      if (results.length === 0) {
        setError(`No movies found for ${label}.`);
      } else {
        setMovies(results);
        setTotalResults(results.length);
      }
    } catch {
      if (!controller.signal.aborted) {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function handleBrowseGenre() {
    if (!browseGenre) return;
    setBrowseYear('');
    runBrowse('genre', browseGenre, () => fetchMoviesByGenre(browseGenre));
  }

  function handleBrowseYear() {
    if (!browseYear) return;
    setBrowseGenre('');
    runBrowse('year', browseYear, () => fetchMoviesByYear(browseYear));
  }

  function handleClearBrowse() {
    browseAbort.current?.abort();
    clearBrowse();
    setBrowseGenre('');
    setBrowseYear('');
    setMovies([]);
    setTotalResults(0);
    setError('');
    setLoading(false);
  }

  useEffect(() => {
    if (!trimmedQuery || browseMode !== null) return;
    setPage(1);
    setSortBy('default');
    fetchMovies(trimmedQuery, 1, false);
  }, [trimmedQuery, browseMode, fetchMovies]);

  useEffect(() => {
    if (urlBrowseHandled.current) return;

    const genreParam = searchParams.get('genre');
    const yearParam = searchParams.get('year');
    if (!genreParam && !yearParam) return;

    urlBrowseHandled.current = true;

    if (genreParam && OMDB_GENRES.includes(genreParam)) {
      setBrowseGenre(genreParam);
      setBrowseYear('');
      runBrowse('genre', genreParam, () => fetchMoviesByGenre(genreParam));
    } else if (yearParam && isValidBrowseYear(yearParam)) {
      setBrowseYear(yearParam);
      setBrowseGenre('');
      runBrowse('year', yearParam, () => fetchMoviesByYear(yearParam));
    }

    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time URL → browse
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    return () => browseAbort.current?.abort();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(trimmedQuery, nextPage, true);
  };

  const hasMore = isSearchMode && movies.length < totalResults;
  const sorted = sortMovies(displayMovies, sortBy);

  const sectionTitle = isIdle
    ? 'Latest releases'
    : isBrowseMode
    ? browseMode === 'genre'
      ? `${browseLabel} movies`
      : `Movies from ${browseLabel}`
    : 'Search results';

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.heroEyebrow}>🎬 Powered by OMDb</span>
        <h1 className={styles.heroTitle}>
          Discover <span className={styles.accent}>Movies</span>
        </h1>
        <p className={styles.heroSub}>
          Browse the latest films, search by title, or filter by genre and year
        </p>
        <SearchBar value={query} onChange={handleQueryChange} />
        <BrowseFilters
          genre={browseGenre}
          year={browseYear}
          onGenreChange={setBrowseGenre}
          onYearChange={setBrowseYear}
          onBrowseGenre={handleBrowseGenre}
          onBrowseYear={handleBrowseYear}
          loading={!isIdle && loading}
        />
      </section>

      {isBrowseMode && browseLabel && !loading && (
        <div className={styles.activeBrowse}>
          <span className={styles.activeBrowseText}>
            Showing <strong>{movies.length}</strong> movies
            {browseMode === 'genre' ? ' in ' : ' from '}
            <strong>{browseLabel}</strong>
          </span>
          <button type="button" className={styles.clearBrowse} onClick={handleClearBrowse}>
            Clear
          </button>
        </div>
      )}

      <section className={styles.gridSection}>
        {!displayLoading && !displayError && displayMovies.length > 0 && (
          <div className={styles.sectionBar}>
            <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
            <SortControls
              value={sortBy}
              onChange={setSortBy}
              total={displayTotal}
            />
          </div>
        )}

        {displayLoading ? (
          <>
            <div className={styles.grid}>
              {Array.from({ length: isIdle ? 12 : 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            {isBrowseMode && (
              <p className={styles.browseHint}>
                Loading {browseMode === 'genre' ? browseLabel : `year ${browseLabel}`}…
                this may take a moment.
              </p>
            )}
            {isIdle && (
              <p className={styles.browseHint}>Loading the newest releases…</p>
            )}
          </>
        ) : displayError ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎭</span>
            <p className={styles.emptyTitle}>No results found</p>
            <p className={styles.emptyText}>{displayError}</p>
            {isBrowseMode && (
              <button type="button" className={styles.clearBrowseBtn} onClick={handleClearBrowse}>
                Clear browse
              </button>
            )}
          </div>
        ) : displayMovies.length === 0 ? (
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
                  {loadingMore ? <span className={styles.spinner} /> : 'Load More'}
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
