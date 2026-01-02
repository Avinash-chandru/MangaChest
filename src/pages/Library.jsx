import { useState, useEffect } from 'react';
import MangaCard from '../components/MangaCard';
import { fetchAllManga, searchMangaAsync, getAllGenresAsync } from '../data/mangaUtils';

function Library() {
  const [allManga, setAllManga] = useState([]);
  const [displayedManga, setDisplayedManga] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [genres, setGenres] = useState(['all']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAllManga();
        const g = await getAllGenresAsync();
        if (!mounted) return;
        setAllManga(list || []);
        setGenres(g || ['all']);
      } catch (err) {
        console.error('Library fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let filtered = allManga;

    if (searchQuery.trim()) {
      filtered = allManga.filter(m =>
        String(m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(m.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.genres || []).some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(manga => (manga.genres || []).includes(selectedGenre));
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'views') {
        const viewsA = parseFloat(String(a.views || '0').replace('M', '')) * 1000000;
        const viewsB = parseFloat(String(b.views || '0').replace('M', '')) * 1000000;
        return viewsB - viewsA;
      }
      if (sortBy === 'title') return String(a.title || '').localeCompare(String(b.title || ''));
      return 0;
    });

    setDisplayedManga(sorted);
  }, [searchQuery, selectedGenre, sortBy, allManga]);

  return (
    <div className="library-page bg-dark min-vh-100 py-5">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-white fw-bold mb-4">
              <i className="bi bi-collection me-2"></i>
              Manga Library
            </h1>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-dark-subtle border-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark-subtle border-0"
                placeholder="Search manga by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <select
              className="form-select form-select-lg bg-dark-subtle border-0"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <select
              className="form-select form-select-lg bg-dark-subtle border-0"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <p className="text-muted">
              Showing {displayedManga.length} manga
              {searchQuery && ` for "${searchQuery}"`}
              {selectedGenre !== 'all' && ` in ${selectedGenre}`}
            </p>
          </div>
        </div>

        {displayedManga.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {displayedManga.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h3 className="text-white mb-2">No manga found</h3>
            <p className="text-muted">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Library;
