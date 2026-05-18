export function sortMovies(movies, sortBy) {
  const arr = [...movies];
  switch (sortBy) {
    case 'title-asc':
      return arr.sort((a, b) => a.Title.localeCompare(b.Title));
    case 'title-desc':
      return arr.sort((a, b) => b.Title.localeCompare(a.Title));
    case 'year-desc':
      return arr.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    case 'year-asc':
      return arr.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    case 'rating-desc':
      return arr.sort(
        (a, b) =>
          parseFloat(b.imdbRating === 'N/A' ? 0 : b.imdbRating) -
          parseFloat(a.imdbRating === 'N/A' ? 0 : a.imdbRating)
      );
    case 'rating-asc':
      return arr.sort(
        (a, b) =>
          parseFloat(a.imdbRating === 'N/A' ? 0 : a.imdbRating) -
          parseFloat(b.imdbRating === 'N/A' ? 0 : b.imdbRating)
      );
    default:
      return arr;
  }
}
