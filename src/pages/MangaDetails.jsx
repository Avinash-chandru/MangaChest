import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchMangaById } from '../data/mangaUtils';
import { addToFavorites, removeFromFavorites, isFavorite, isAuthenticated } from '../utils/auth';

function MangaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const m = await fetchMangaById(id);
        if (!mounted) return;
        setManga(m);
        setFavorite(isFavorite(parseInt(id)));
      } catch (err) {
        console.error('MangaDetails fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="text-white">Manga not found</h2>
          <Link to="/library" className="btn btn-danger mt-3">Back to Library</Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="text-white">Manga not found</h2>
          <Link to="/library" className="btn btn-danger mt-3">Back to Library</Link>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: { pathname: `/manga/${id}` } } });
      return;
    }

    if (favorite) {
      removeFromFavorites(parseInt(id));
      setFavorite(false);
    } else {
      addToFavorites(parseInt(id));
      setFavorite(true);
    }
  };

  const handleStartReading = () => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: { pathname: `/reader/${manga.id}/${manga.chapters[0].id}` } } });
      return;
    }

    if (manga.chapters && manga.chapters.length > 0) {
      navigate(`/reader/${manga.id}/${manga.chapters[0].id}`);
    }
  };

  return (
    <div className="manga-details-page bg-dark text-white">
      <div
        className="hero-banner position-relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(18, 18, 18, 1)), url(${manga.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          minHeight: '500px'
        }}
      >
        <div className="container position-relative" style={{ paddingTop: '100px' }}>
          <div className="row">
            <div className="col-md-4">
              <img
                src={manga.coverImage}
                alt={manga.title}
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '600px', objectFit: 'cover', width: '100%' }}
              />
            </div>

            <div className="col-md-8 d-flex flex-column justify-content-center">
              <div className="mb-3">
                <span className="badge bg-danger me-2 px-3 py-2">
                  {manga.type === 'manga' ? 'MANGA' : 'WEBTOON'}
                </span>
                {manga.isTrending && (
                  <span className="badge bg-warning text-dark me-2 px-3 py-2">
                    🔥 TRENDING
                  </span>
                )}
              </div>

              <h1 className="display-3 fw-bold mb-2" style={{ fontFamily: 'serif' }}>
                {manga.title}
              </h1>

              <p className="fs-4 text-muted mb-4" style={{ fontFamily: 'serif' }}>
                {manga.subtitle}
              </p>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <button
                  onClick={handleStartReading}
                  className="btn btn-danger btn-lg px-4"
                >
                  <i className="bi bi-play-fill me-2"></i>
                  Start Reading
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className={`btn btn-lg px-4 ${favorite ? 'btn-warning' : 'btn-outline-light'}`}
                >
                  <i className={`bi ${favorite ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                  {favorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>

              <div className="d-flex flex-wrap gap-3 mb-3">
                <div>
                  <small className="text-muted d-block">STATUS</small>
                  <span className={`badge ${manga.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>
                    {manga.status}
                  </span>
                </div>
                <div>
                  <small className="text-muted d-block">RATING</small>
                  <span className="text-warning">
                    <i className="bi bi-star-fill"></i> {manga.rating}/5.0
                  </span>
                </div>
                <div>
                  <small className="text-muted d-block">VIEWS</small>
                  <span>{manga.views}</span>
                </div>
                <div>
                  <small className="text-muted d-block">FAVORITES</small>
                  <span>{manga.favorites?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="mb-5">
              <h2 className="mb-4" style={{ fontFamily: 'serif', fontSize: '2.5rem' }}>
                Synopsis
              </h2>
              <hr className="border-secondary mb-4" style={{ width: '150px', height: '3px', opacity: 1 }} />

              <div className="row">
                <div className="col-md-6">
                  <p className="lead" style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                    {manga.description}
                  </p>
                </div>
                <div className="col-md-6">
                  {manga.chapters && manga.chapters[0] && (
                    <img
                      src={manga.chapters[0].pages[0]}
                      alt="Preview"
                      className="img-fluid rounded shadow"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="mb-3">Information</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Aired:</strong> {manga.releaseDate}
                  </p>
                  <p className="mb-2">
                    <strong>Genres:</strong> {manga.genres.join(', ')}
                  </p>
                </div>
                <div className="col-md-6">
                  {manga.duration && (
                    <p className="mb-2">
                      <strong>Duration:</strong> {manga.duration}
                    </p>
                  )}
                  {manga.contentRating && (
                    <p className="mb-2">
                      <strong>Rating:</strong> {manga.contentRating}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {manga.characters && manga.characters.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-4">Characters</h3>
                <div className="row g-4">
                  {manga.characters.map((character, index) => (
                    <div key={index} className="col-md-4">
                      <div className="card bg-dark-subtle border-0 h-100">
                        <img
                          src={character.image}
                          className="card-img-top"
                          alt={character.name}
                          style={{ height: '300px', objectFit: 'cover' }}
                        />
                        <div className="card-body">
                          <h5 className="card-title text-white">{character.name}</h5>
                          <p className="card-text text-muted small">
                            {character.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card bg-dark-subtle border-0 sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-transparent border-0">
                <h4 className="mb-0">Chapters</h4>
              </div>
              <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {manga.chapters && manga.chapters.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {manga.chapters.map((chapter) => (
                      <Link
                        key={chapter.id}
                        to={`/reader/${manga.id}/${chapter.id}`}
                        onClick={(e) => {
                          if (!isAuthenticated()) {
                            e.preventDefault();
                            navigate('/login', { replace: true, state: { from: { pathname: `/reader/${manga.id}/${chapter.id}` } } });
                          }
                        }}
                        className="list-group-item list-group-item-action bg-dark text-white border-secondary"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">Chapter {chapter.chapterNumber}</h6>
                            <small className="text-muted">{chapter.title}</small>
                          </div>
                          <i className="bi bi-chevron-right"></i>
                        </div>
                        <small className="text-muted d-block mt-2">
                          <i className="bi bi-calendar me-1"></i>
                          {chapter.releaseDate}
                        </small>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-4">No chapters available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaDetails;
