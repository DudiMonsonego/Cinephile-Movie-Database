import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import styles from './MovieCard.module.css';

const FALLBACK_POSTER = 'https://via.placeholder.com/300x450?text=No+Poster';

export default function MovieCard({ movie }) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const saved = isInWatchlist(movie.imdbID);

  const poster =
    movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_POSTER;

  const rating =
    movie.imdbRating && movie.imdbRating !== 'N/A'
      ? movie.imdbRating
      : null;

  function handleWatchlist(e) {
    e.preventDefault();
    if (saved) {
      removeFromWatchlist(movie.imdbID);
    } else {
      addToWatchlist(movie);
    }
  }

  return (
    <Link to={`/movie/${movie.imdbID}`} className={styles.card}>
      <div className={styles.posterWrap}>
        <img
          src={poster}
          alt={`${movie.Title} poster`}
          className={styles.poster}
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_POSTER; }}
        />
        <div className={styles.overlay}>
          <span className={styles.viewBtn}>View Details</span>
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title} title={movie.Title}>
          {movie.Title}
        </h3>
        <div className={styles.meta}>
          <span className={styles.year}>{movie.Year}</span>
          {rating && (
            <span className={styles.rating}>
              <svg viewBox="0 0 20 20" fill="currentColor" className={styles.star}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}
            </span>
          )}
        </div>
      </div>

      <button
        className={`${styles.watchlistBtn} ${saved ? styles.saved : ''}`}
        onClick={handleWatchlist}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
      >
        {saved ? '♥' : '♡'}
      </button>
    </Link>
  );
}
