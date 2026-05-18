import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWatchlist } from '../context/WatchlistContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { watchlist } = useWatchlist();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎬</span>
          <span className={styles.logoName}>Cinephile</span>
        </Link>

        <div className={styles.right}>
          <NavLink
            to="/watchlist"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.linkIcon}>♥</span>
            Watchlist
            {watchlist.length > 0 && (
              <span className={styles.badge}>{watchlist.length}</span>
            )}
          </NavLink>

          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  );
}
