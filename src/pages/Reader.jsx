import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { fetchMangaById } from '../data/mangaUtils';
import { addToReadingHistory, isAuthenticated } from '../utils/auth';

// Note: useCallback is used to keep handlers stable so keydown listener linter warnings are resolved.

function Reader() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState('manga');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const m = await fetchMangaById(mangaId);
        if (!mounted) return;
        setManga(m);
        if (m?.type === 'webtoon') setReadingMode('webtoon');
        if (m && chapterId) addToReadingHistory(parseInt(mangaId), parseInt(chapterId));
      } catch (err) {
        console.error('Reader fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [mangaId, chapterId]);

  const chapter = manga?.chapters.find(ch => String(ch.id) === String(chapterId));
  const currentChapterIndex = manga?.chapters.findIndex(ch => String(ch.id) === String(chapterId));

  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <h2>Chapter not found</h2>
          <Link to="/library" className="btn btn-danger mt-3">Back to Library</Link>
        </div>
      </div>
    );
  }

  const handleNextChapter = useCallback(() => {
    if (currentChapterIndex < manga.chapters.length - 1) {
      const nextChapter = manga.chapters[currentChapterIndex + 1];
      navigate(`/reader/${mangaId}/${nextChapter.id}`);
      setCurrentPage(0);
    }
  }, [currentChapterIndex, manga, mangaId, navigate]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const prevChapter = manga.chapters[currentChapterIndex - 1];
      navigate(`/reader/${mangaId}/${prevChapter.id}`);
      setCurrentPage(0);
    }
  }, [currentChapterIndex, manga, mangaId, navigate]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev < chapter.pages.length - 1) {
        return prev + 1;
      }
      handleNextChapter();
      return prev;
    });
  }, [chapter, handleNextChapter]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev > 0) return prev - 1;
      handlePrevChapter();
      return prev;
    });
  }, [handlePrevChapter]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  }, [exitFullscreen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (readingMode === 'manga') {
        if (e.key === 'ArrowRight') handleNextPage();
        if (e.key === 'ArrowLeft') handlePrevPage();
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'Escape' && isFullscreen) exitFullscreen();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [readingMode, isFullscreen, handleNextPage, handlePrevPage, toggleFullscreen, exitFullscreen]);

  if (!manga || !chapter) {
    return (
      <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <h2>Chapter not found</h2>
          <Link to="/library" className="btn btn-danger mt-3">Back to Library</Link>
        </div>
      </div>
    );
  }

  // Handlers for page/chapter navigation are implemented above using useCallback to keep references stable.

  // Fullscreen handlers are implemented above using useCallback to keep stable references.

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  return (
    <div className="reader-page bg-black text-white min-vh-100">
      {showControls && (
        <div className="reader-header bg-dark shadow-sm sticky-top">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col-md-4">
                <Link
                  to={`/manga/${mangaId}`}
                  className="btn btn-sm btn-outline-light"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Details
                </Link>
              </div>

              <div className="col-md-4 text-center">
                <h6 className="mb-0">
                  {manga.title} - Chapter {chapter.chapterNumber}
                </h6>
                <small className="text-muted">{chapter.title}</small>
              </div>

              <div className="col-md-4 text-end">
                <div className="btn-group btn-group-sm me-2">
                  <button
                    className={`btn ${readingMode === 'manga' ? 'btn-danger' : 'btn-outline-light'}`}
                    onClick={() => setReadingMode('manga')}
                  >
                    <i className="bi bi-book me-1"></i>
                    Manga
                  </button>
                  <button
                    className={`btn ${readingMode === 'webtoon' ? 'btn-danger' : 'btn-outline-light'}`}
                    onClick={() => setReadingMode('webtoon')}
                  >
                    <i className="bi bi-phone me-1"></i>
                    Webtoon
                  </button>
                </div>

                <button
                  className="btn btn-sm btn-outline-light me-2"
                  onClick={toggleFullscreen}
                >
                  <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                </button>

                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => setShowControls(false)}
                >
                  <i className="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>

            {readingMode === 'manga' && (
              <div className="row pb-3">
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      className="btn btn-outline-light"
                      onClick={handlePrevPage}
                      disabled={currentPage === 0 && currentChapterIndex === 0}
                    >
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>

                    <div className="d-flex align-items-center gap-3">
                      <button className="btn btn-sm btn-outline-light" onClick={handleZoomOut}>
                        <i className="bi bi-dash-lg"></i>
                      </button>
                      <span>{zoom}%</span>
                      <button className="btn btn-sm btn-outline-light" onClick={handleZoomIn}>
                        <i className="bi bi-plus-lg"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-light" onClick={resetZoom}>
                        Reset
                      </button>
                    </div>

                    <span className="text-muted">
                      Page {currentPage + 1} of {chapter.pages.length}
                    </span>

                    <button
                      className="btn btn-outline-light"
                      onClick={handleNextPage}
                      disabled={
                        currentPage === chapter.pages.length - 1 &&
                        currentChapterIndex === manga.chapters.length - 1
                      }
                    >
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showControls && (
        <button
          className="btn btn-danger position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1000 }}
          onClick={() => setShowControls(true)}
        >
          <i className="bi bi-eye"></i>
        </button>
      )}

      <div className="reader-content">
        {readingMode === 'manga' ? (
          <div className="manga-mode d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <div className="text-center">
              <img
                src={chapter.pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="img-fluid shadow-lg"
                style={{
                  maxHeight: '90vh',
                  maxWidth: '100%',
                  transform: `scale(${zoom / 100})`,
                  transition: 'transform 0.3s ease'
                }}
              />
              <div className="mt-3">
                <div className="progress" style={{ height: '5px' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${((currentPage + 1) / chapter.pages.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="webtoon-mode container" style={{ maxWidth: '800px' }}>
            {chapter.pages.map((page, index) => (
              <div key={index} className="mb-0">
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="img-fluid w-100"
                  style={{
                    display: 'block',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                  }}
                />
              </div>
            ))}

            <div className="text-center py-5">
              <h4 className="mb-3">End of Chapter {chapter.chapterNumber}</h4>
              <div className="d-flex gap-3 justify-content-center">
                {currentChapterIndex > 0 && (
                  <button className="btn btn-outline-light" onClick={handlePrevChapter}>
                    <i className="bi bi-chevron-left me-2"></i>
                    Previous Chapter
                  </button>
                )}
                {currentChapterIndex < manga.chapters.length - 1 && (
                  <button className="btn btn-danger" onClick={handleNextChapter}>
                    Next Chapter
                    <i className="bi bi-chevron-right ms-2"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {readingMode === 'webtoon' && showControls && (
        <div className="floating-controls position-fixed bottom-0 end-0 m-4">
          <div className="btn-group-vertical shadow">
            <button className="btn btn-dark" onClick={handleZoomOut}>
              <i className="bi bi-dash-lg"></i>
            </button>
            <button className="btn btn-dark" onClick={resetZoom}>
              {zoom}%
            </button>
            <button className="btn btn-dark" onClick={handleZoomIn}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reader;
