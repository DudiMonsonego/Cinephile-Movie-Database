import styles from './SortControls.module.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
  { value: 'year-desc', label: 'Year (Newest)' },
  { value: 'year-asc', label: 'Year (Oldest)' },
  { value: 'rating-desc', label: 'Rating (High–Low)' },
  { value: 'rating-asc', label: 'Rating (Low–High)' },
];

export default function SortControls({ value, onChange, total }) {
  return (
    <div className={styles.wrapper}>
      {total != null && (
        <span className={styles.count}>
          {total} result{total !== 1 ? 's' : ''}
        </span>
      )}
      <label className={styles.label} htmlFor="sort-select">
        Sort by
      </label>
      <select
        id="sort-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
