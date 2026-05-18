import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import styles from './MovieDetails.module.css';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const FALLBACK_POSTER = 'https://via.placeholder.com/400x600?text=No+Poster';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const saved = movie ? isInWatchlist(movie.imdbID) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError('');
    setMovie(null);

    fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.Response === 'False') {
          setError(data.Error || 'Movie not found.');
        } else {
          setMovie(data);
        }
      })
      .catch(() => setError('Failed to load movie details.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleWatchlist() {
    if (saved) removeFromWatchlist(movie.imdbID);
    else addToWatchlist(movie);
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.detailSkeleton}>
          <div className={`${styles.shimmer} ${styles.skPoster}`} />
          <div className={styles.skInfo}>
            <div className={`${styles.shimmer} ${styles.skTitle}`} />
            <div className={`${styles.shimmer} ${styles.skLine}`} />
            <div className={`${styles.shimmer} ${styles.skLine}`} />
            <div className={`${styles.shimmer} ${styles.skPlot}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}>🎭</span>
        <h2>{error}</h2>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!movie) return null;

  const poster =
    movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_POSTER;

  const cast = movie.Actors && movie.Actors !== 'N/A'
    ? movie.Actors.split(',').map((a) => a.trim())
    : [];

  const genres = movie.Genre && movie.Genre !== 'N/A'
    ? movie.Genre.split(',').map((g) => g.trim())
    : [];

  const ratings = (movie.Ratings || []).filter(
    (r) => r.Value !== 'N/A'
  );

  return (
    <div className={styles.page}>
      {/* Blurred backdrop using poster */}
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${poster})` }}
        aria-hidden="true"
      />

      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={styles.content}>
          {/* Poster */}
          <div className={styles.posterCol}>
            <img
              src={poster}
              alt={`${movie.Title} poster`}
              className={styles.poster}
            />
          </div>

          {/* Info */}
          <div className={styles.infoCol}>
            <div className={styles.badges}>
              {genres.map((g) => (
                <span key={g} className={styles.badge}>
                  {g}
                </span>
              ))}
            </div>

            <h1 className={styles.title}>{movie.Title}</h1>

            <div className={styles.metaRow}>
              {movie.Year !== 'N/A' && (
                <span className={styles.metaItem}>{movie.Year}</span>
              )}
              {movie.Runtime !== 'N/A' && (
                <span className={styles.metaItem}>{movie.Runtime}</span>
              )}
              {movie.Rated !== 'N/A' && (
                <span className={`${styles.metaItem} ${styles.rated}`}>
                  {movie.Rated}
                </span>
              )}
            </div>

            {ratings.length > 0 && (
              <div className={styles.ratingsRow}>
                {ratings.map((r) => (
                  <div key={r.Source} className={styles.ratingBadge}>
                    <span className={styles.ratingSource}>
                      {r.Source === 'Internet Movie Database'
                        ? 'IMDb'
                        : r.Source === 'Rotten Tomatoes'
                        ? '🍅'
                        : r.Source}
                    </span>
                    <span className={styles.ratingValue}>{r.Value}</span>
                  </div>
                ))}
              </div>
            )}

            {movie.Plot && movie.Plot !== 'N/A' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Plot</h2>
                <p className={styles.plot}>{movie.Plot}</p>
              </div>
            )}

            {cast.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Cast</h2>
                <div className={styles.castList}>
                  {cast.map((actor) => (
                    <span key={actor} className={styles.castTag}>
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.Director && movie.Director !== 'N/A' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Director</h2>
                <p className={styles.director}>{movie.Director}</p>
              </div>
            )}

            <button
              className={`${styles.watchlistBtn} ${saved ? styles.saved : ''}`}
              onClick={handleWatchlist}
            >
              {saved ? '♥ Remove from Watchlist' : '♡ Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
