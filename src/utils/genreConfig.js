export const OMDB_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western',
];

export const GENRE_QUERIES = {
  Action: ['action', 'mission', 'agent', 'war', 'fight'],
  Adventure: ['adventure', 'quest', 'journey'],
  Animation: ['animation', 'animated', 'pixar'],
  Biography: ['biography', 'life story'],
  Comedy: ['comedy', 'funny'],
  Crime: ['crime', 'heist', 'detective'],
  Documentary: ['documentary'],
  Drama: ['drama'],
  Family: ['family', 'kids'],
  Fantasy: ['fantasy', 'magic', 'wizard'],
  History: ['history', 'historical'],
  Horror: ['horror', 'haunted'],
  Music: ['music', 'musical', 'concert'],
  Mystery: ['mystery', 'murder', 'detective'],
  Romance: ['romance', 'love'],
  'Sci-Fi': ['space', 'future', 'robot', 'alien'],
  Sport: ['sport', 'boxing', 'racing'],
  Thriller: ['thriller', 'suspense'],
  War: ['war', 'battle', 'soldier'],
  Western: ['western', 'cowboy'],
};

export function getGenreQueries(genre) {
  return GENRE_QUERIES[genre] || [genre];
}
