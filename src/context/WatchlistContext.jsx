import { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cinephile-watchlist')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cinephile-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (movie) => {
    setWatchlist((prev) =>
      prev.find((m) => m.imdbID === movie.imdbID) ? prev : [...prev, movie]
    );
  };

  const removeFromWatchlist = (imdbID) => {
    setWatchlist((prev) => prev.filter((m) => m.imdbID !== imdbID));
  };

  const isInWatchlist = (imdbID) => watchlist.some((m) => m.imdbID === imdbID);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
