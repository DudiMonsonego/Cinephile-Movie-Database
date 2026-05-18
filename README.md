# Cinephile — Movie Database

A responsive movie discovery web app where you can search the OMDb catalog, explore rich detail pages, and build a personal watchlist that persists in the browser.

Built as a **portfolio project** to demonstrate modern React patterns, API integration, and polished UI without relying on a component library.

---

## Highlights

| Area | What it demonstrates |
|------|----------------------|
| **Data fetching** | Debounced search, pagination, and graceful handling of partial / empty API responses |
| **State management** | React Context for theme and watchlist, with `localStorage` persistence |
| **Routing** | Shareable URLs for every title (`/movie/:id`) via React Router |
| **UX** | Skeleton loaders, dark/light mode, sort controls, and accessible error states |
| **Styling** | CSS Modules + design tokens — no Tailwind or UI kit |

---

## Features

- **Live search** — queries the [OMDb API](https://www.omdbapi.com/) as you type (450ms debounce)
- **Movie grid** — responsive cards with poster, title, year, and IMDb rating
- **Detail pages** — plot, cast, director, ratings, and cinematic blurred backdrop
- **Watchlist** — add/remove titles; saved across sessions in `localStorage`
- **Sorting** — relevance, title (A–Z / Z–A), year, or rating
- **Dark / light mode** — toggle in the navbar; preference persisted
- **Load more** — paginated results beyond the first page
- **Loading & errors** — shimmer skeletons and clear messages when nothing matches

---

## Tech stack

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [React Router 7](https://reactrouter.com/)
- CSS Modules (component-scoped styles)
- Context API (`ThemeContext`, `WatchlistContext`)
- [OMDb API](https://www.omdbapi.com/) for movie data

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- A free [OMDb API key](https://www.omdbapi.com/apikey.aspx) (1,000 requests/day on the free tier)

### 1. Clone the repository

```bash
git clone https://github.com/DudiMonsonego/Cinephile-Movie-Database.git
cd Cinephile-Movie-Database
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_OMDB_API_KEY=your_api_key_here
```

> **Note:** `.env` is gitignored. Never commit API keys to version control.

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project structure

```
src/
├── components/
│   ├── Navbar.jsx           # Sticky nav, theme toggle, watchlist badge
│   ├── SearchBar.jsx        # Auto-focused search with clear button
│   ├── MovieCard.jsx        # Grid card + watchlist action
│   ├── SkeletonCard.jsx     # Shimmer loading placeholder
│   └── SortControls.jsx     # Sort dropdown + result count
├── context/
│   ├── ThemeContext.jsx     # Dark / light mode
│   └── WatchlistContext.jsx # Watchlist + localStorage sync
├── hooks/
│   └── useDebounce.js       # Reusable debounce hook
├── pages/
│   ├── Home.jsx             # Search, grid, pagination
│   ├── MovieDetails.jsx     # Full detail view
│   └── Watchlist.jsx        # Saved movies
├── App.jsx                  # Router and providers
└── index.css                # CSS variables and base styles
```

---

## Deployment

This app is a static SPA after `npm run build`. Deploy the `dist/` folder to any static host, for example:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

Set `VITE_OMDB_API_KEY` in your host’s environment variables before building.

---

## Screenshots

_Add screenshots or a short GIF here after deploying — recruiters love seeing the UI at a glance._

Suggested captures: home search grid, movie detail page, watchlist, and dark mode.

---

## Author

**Dudi Monsonego** — [GitHub @DudiMonsonego](https://github.com/DudiMonsonego)

---

## License

This project is open source and available for portfolio review. Feel free to explore the code; please credit the author if you fork or reuse substantial portions.
