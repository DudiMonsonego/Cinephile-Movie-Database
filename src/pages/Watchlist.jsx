import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import styles from './Watchlist.module.css';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.heart}>♥</span> My Watchlist
        </h1>
        {watchlist.length > 0 && (
          <p className={styles.sub}>
            {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} saved
          </p>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🍿</span>
          <h2 className={styles.emptyTitle}>Your watchlist is empty</h2>
          <p className={styles.emptyText}>
            Browse movies and hit ♡ to save them here
          </p>
          <Link to="/" className={styles.browseBtn}>
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {watchlist.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      )}
    </main>
  );
}
