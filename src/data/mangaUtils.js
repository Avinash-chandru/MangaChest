import { mangaData } from './mangaData';
import * as mangaService from '../config/mangaService';

// Legacy synchronous helpers (kept for quick local usage / testing)
export const getTopRatedManga = () => {
  return [...mangaData].sort((a, b) => b.rating - a.rating).slice(0, 6);
};

export const getTrendingManga = () => {
  return mangaData.filter(manga => manga.isTrending);
};

export const getFeaturedManga = () => {
  return mangaData.filter(manga => manga.isFeatured);
};

export const getMangaById = (id) => {
  return mangaData.find(manga => String(manga.id) === String(id));
};

// Async Firestore-backed helpers with local fallbacks
export async function fetchAllManga() {
  try {
    const res = await mangaService.getAllManga();
    if (res && res.success && Array.isArray(res.data)) return res.data;
  } catch (err) {
    console.error('fetchAllManga firestore error:', err);
  }
  // fallback to local data
  return mangaData;
}

export async function fetchMangaById(id) {
  try {
    const res = await mangaService.getMangaById(String(id));
    if (res && res.success && res.data) return res.data;
  } catch (err) {
    console.error('fetchMangaById firestore error:', err);
  }
  // fallback to local data
  return getMangaById(id) || null;
}

export async function searchMangaAsync(query) {
  const list = await fetchAllManga();
  const lowercaseQuery = (query || '').toLowerCase();
  return list.filter(manga =>
    String(manga.title || '').toLowerCase().includes(lowercaseQuery) ||
    String(manga.author || '').toLowerCase().includes(lowercaseQuery) ||
    (Array.isArray(manga.genres) && manga.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)))
  );
}

export async function filterMangaByGenreAsync(genre) {
  const list = await fetchAllManga();
  if (!genre || genre === 'all') return list;
  return list.filter(manga => (manga.genres || []).includes(genre));
}

export async function getAllGenresAsync() {
  const list = await fetchAllManga();
  const genres = new Set();
  list.forEach(m => (m.genres || []).forEach(g => genres.add(g)));
  return ['all', ...Array.from(genres)].sort();
}

export async function getTopRatedMangaAsync(limit = 6) {
  const list = await fetchAllManga();
  return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, limit);
}

export async function getTrendingMangaAsync() {
  const list = await fetchAllManga();
  return list.filter(m => m.isTrending);
}

export async function getFeaturedMangaAsync() {
  const list = await fetchAllManga();
  return list.filter(m => m.isFeatured);
}

export default {
  fetchAllManga,
  fetchMangaById,
  searchMangaAsync,
  filterMangaByGenreAsync,
  getAllGenresAsync,
  getTopRatedMangaAsync,
  getTrendingMangaAsync,
  getFeaturedMangaAsync
};
