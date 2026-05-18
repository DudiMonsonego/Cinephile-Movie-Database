import { OMDB_GENRES } from '../utils/genreConfig';
import { isValidBrowseYear } from '../utils/fetchMoviesByYear';
import styles from './BrowseFilters.module.css';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

export default function BrowseFilters({
  genre,
  year,
  onGenreChange,
  onYearChange,
  onBrowseGenre,
  onBrowseYear,
  loading,
}) {
  return (
    <div className={styles.panel}>
      <p className={styles.label}>Or browse by genre or year</p>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="browse-genre">
            Genre
          </label>
          <div className={styles.fieldInner}>
            <select
              id="browse-genre"
              className={styles.select}
              value={genre}
              onChange={(e) => onGenreChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select genre…</option>
              {OMDB_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.btn}
              onClick={onBrowseGenre}
              disabled={loading || !genre}
            >
              Browse
            </button>
          </div>
        </div>

        <span className={styles.divider}>or</span>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="browse-year">
            Year
          </label>
          <div className={styles.fieldInner}>
            <select
              id="browse-year"
              className={styles.select}
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select year…</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.btn}
              onClick={onBrowseYear}
              disabled={loading || !year || !isValidBrowseYear(year)}
            >
              Browse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
