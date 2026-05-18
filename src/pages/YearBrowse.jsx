import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import SortControls from '../components/SortControls';
import {
  fetchMoviesByYear,
  isValidBrowseYear,
} from '../utils/fetchMoviesByYear';
import { sortMovies } from '../utils/sortMovies';
import styles from './YearBrowse.module.css';

export default function YearBrowse() {
  const { year: yearParam } = useParams();
  const navigate = useNavigate();
  const year = yearParam || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [sortBy, setSortBy] = useState('rating-desc');

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isValidBrowseYear(year)) {
      setError('Invalid release year.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setMovies([]);
    setProgress(0);

    fetchMoviesByYear(year, (found) => {
      if (!cancelled) setProgress(found);
    })
      .then((results) => {
        if (cancelled) return;
        if (results.length === 0) {
          setError(`No movies found for ${year}. Try another year.`);
        } else {
          setMovies(results);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load movies. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  const sorted = sortMovies(movies, sortBy);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>Browse by year</span>
          <h1 className={styles.title}>
            Movies from <span className={styles.yearAccent}>{year}</span>
          </h1>
          <p className={styles.sub}>
            {loading
              ? `Loading titles… ${progress > 0 ? `(${progress} found so far)` : ''}`
              : movies.length > 0
              ? `${movies.length} titles · sorted by rating`
              : `Releases from ${year}`}
          </p>
        </div>
      </div>

      {!loading && !error && movies.length > 0 && (
        <div className={styles.controls}>
          <SortControls
            value={sortBy}
            onChange={setSortBy}
            total={movies.length}
          />
        </div>
      )}

      <section className={styles.gridSection}>
        {loading ? (
          <>
            <div className={styles.grid}>
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <p className={styles.loadingHint}>Fetching {year} releases from OMDb…</p>
          </>
        ) : error ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎭</span>
            <p className={styles.emptyTitle}>{error}</p>
            <Link to="/" className={styles.browseBtn}>
              Back to search
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
