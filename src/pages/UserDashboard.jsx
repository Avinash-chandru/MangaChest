import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, getReadingHistory, getFavorites } from '../utils/auth';
import { fetchMangaById } from '../data/mangaUtils';
import MangaCard from '../components/MangaCard';

function UserDashboard() {
  const user = getCurrentUser();
  const readingHistory = getReadingHistory();
  const favoriteIds = getFavorites();

  const [continueReading, setContinueReading] = useState([]);
  const [favoriteManga, setFavoriteManga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Continue reading (take first 4 history items)
        const hist = readingHistory.slice(0, 4);
        const mangaPromises = hist.map(item => fetchMangaById(item.mangaId));
        const mangaResults = await Promise.all(mangaPromises);
        const continueList = hist.map((item, idx) => {
          const manga = mangaResults[idx];
          if (!manga) return null;
          const chapter = (manga.chapters || []).find(ch => String(ch.id) === String(item.chapterId));
          return { manga, chapter, lastRead: item.lastRead };
        }).filter(Boolean);

        // Favorites
        const uniqueFavIds = Array.from(new Set(favoriteIds));
        const favPromises = uniqueFavIds.map(id => fetchMangaById(id));
        const favResults = await Promise.all(favPromises);
        const favList = favResults.filter(Boolean);

        if (!mounted) return;
        setContinueReading(continueList);
        setFavoriteManga(favList);
      } catch (err) {
        console.error('UserDashboard fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [readingHistory, favoriteIds]);

  const stats = {
    mangaRead: readingHistory.length,
    favorites: favoriteIds.length,
    chaptersRead: readingHistory.length * 2.5,
    hoursSpent: Math.floor(readingHistory.length * 0.8)
  };

  return (
    <div className="user-dashboard bg-dark min-vh-100 text-white">
      <div className="dashboard-header bg-gradient py-5" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #8b0000 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-auto">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="rounded-circle border border-3 border-white"
                width="100"
                height="100"
              />
            </div>
            <div className="col">
              <h1 className="mb-2">Welcome back, {user?.name}!</h1>
              <p className="mb-0 opacity-75">{user?.email}</p>
              <p className="mb-0 small">Member since {new Date(user?.joinedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card bg-dark-subtle border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-book fs-1 text-danger mb-3 d-block"></i>
                <h3 className="mb-1">{stats.mangaRead}</h3>
                <p className="text-muted mb-0">Manga Read</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark-subtle border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-heart-fill fs-1 text-danger mb-3 d-block"></i>
                <h3 className="mb-1">{stats.favorites}</h3>
                <p className="text-muted mb-0">Favorites</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark-subtle border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-journal-text fs-1 text-danger mb-3 d-block"></i>
                <h3 className="mb-1">{Math.floor(stats.chaptersRead)}</h3>
                <p className="text-muted mb-0">Chapters Read</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-dark-subtle border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-clock fs-1 text-danger mb-3 d-block"></i>
                <h3 className="mb-1">{stats.hoursSpent}</h3>
                <p className="text-muted mb-0">Hours Spent</p>
              </div>
            </div>
          </div>
        </div>

        {continueReading.length > 0 && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <i className="bi bi-clock-history text-danger me-2"></i>
                Continue Reading
              </h2>
            </div>
            <div className="row g-4">
              {continueReading.map((item, index) => (
                <div key={index} className="col-md-6 col-lg-3">
                  <div className="card bg-dark-subtle border-0 h-100">
                    <img
                      src={item.manga.coverImage}
                      className="card-img-top"
                      alt={item.manga.title}
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                    <div className="card-body">
                      <h6 className="card-title text-truncate">{item.manga.title}</h6>
                      <p className="card-text text-muted small mb-3">
                        Chapter {item.chapter?.chapterNumber}: {item.chapter?.title}
                      </p>
                      <Link
                        to={`/reader/${item.manga.id}/${item.chapter?.id}`}
                        className="btn btn-sm btn-danger w-100"
                      >
                        Continue Reading
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {favoriteManga.length > 0 ? (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                My Favorites
              </h2>
              <Link to="/library" className="btn btn-outline-danger">
                Browse More
              </Link>
            </div>
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
              {favoriteManga.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-5">
            <div className="card bg-dark-subtle border-0 text-center py-5">
              <div className="card-body">
                <i className="bi bi-heart fs-1 text-muted mb-3 d-block"></i>
                <h4 className="mb-3">No favorites yet</h4>
                <p className="text-muted mb-4">
                  Start adding manga to your favorites to see them here
                </p>
                <Link to="/library" className="btn btn-danger">
                  Explore Library
                </Link>
              </div>
            </div>
          </section>
        )}

        {readingHistory.length === 0 && (
          <section className="text-center py-5">
            <i className="bi bi-book fs-1 text-muted mb-3 d-block"></i>
            <h3 className="mb-3">Start Your Reading Journey</h3>
            <p className="text-muted mb-4">
              You have not read any manga yet. Explore our library to get started!
            </p>
            <Link to="/library" className="btn btn-danger btn-lg">
              Browse Library
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
