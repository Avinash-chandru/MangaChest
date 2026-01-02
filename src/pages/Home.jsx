import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MangaCard from '../components/MangaCard';
import { getFeaturedMangaAsync, getTrendingMangaAsync, getTopRatedMangaAsync } from '../data/mangaUtils';

function Home() {
  const [featuredManga, setFeaturedManga] = useState([]);
  const [trendingManga, setTrendingManga] = useState([]);
  const [topRatedManga, setTopRatedManga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [featured, trending, topRated] = await Promise.all([
          getFeaturedMangaAsync(),
          getTrendingMangaAsync(),
          getTopRatedMangaAsync()
        ]);
        if (!mounted) return;
        setFeaturedManga(featured || []);
        setTrendingManga(trending || []);
        setTopRatedManga(topRated || []);
      } catch (err) {
        console.error('Home data fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const heroBanner = featuredManga[0];

  return (
    <div className="home-page">
      <section
        className="hero-section position-relative text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${heroBanner?.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '600px'
        }}
      >
        <div className="container h-100">
          <div className="row h-100 align-items-center" style={{ minHeight: '600px' }}>
            <div className="col-lg-6">
              <div className="hero-content">
                <span className="badge bg-danger mb-3 px-3 py-2">Featured</span>
                <h1 className="display-3 fw-bold mb-3">{heroBanner?.title}</h1>
                <p className="fs-5 text-light mb-3">{heroBanner?.subtitle}</p>
                <div className="mb-4">
                  <span className="badge bg-dark me-2 px-3 py-2">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {heroBanner?.rating}
                  </span>
                  <span className="badge bg-dark me-2 px-3 py-2">
                    <i className="bi bi-eye me-1"></i>
                    {heroBanner?.views}
                  </span>
                  {heroBanner?.genres.map((genre, index) => (
                    <span key={index} className="badge bg-dark me-2 px-3 py-2">
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="lead mb-4" style={{ maxWidth: '600px' }}>
                  {heroBanner?.description.substring(0, 200)}...
                </p>
                <div className="d-flex gap-3">
                  <Link
                    to={`/manga/${heroBanner?.id}`}
                    className="btn btn-danger btn-lg px-4"
                  >
                    <i className="bi bi-play-fill me-2"></i>
                    Read Now
                  </Link>
                  <Link
                    to={`/manga/${heroBanner?.id}`}
                    className="btn btn-outline-light btn-lg px-4"
                  >
                    <i className="bi bi-info-circle me-2"></i>
                    More Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-dark">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-white fw-bold mb-0">
              <i className="bi bi-fire text-danger me-2"></i>
              Trending Now
            </h2>
            <Link to="/library" className="btn btn-outline-danger">
              View All
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {trendingManga.slice(0, 4).map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-black">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-white fw-bold mb-0">
              <i className="bi bi-stars text-warning me-2"></i>
              Top Rated
            </h2>
            <Link to="/library" className="btn btn-outline-danger">
              View All
            </Link>
          </div>
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {topRatedManga.slice(0, 4).map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-dark">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="text-white fw-bold mb-3">Why Choose MangaChest?</h2>
            <p className="text-muted">Your ultimate manga reading experience</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="feature-icon bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-book fs-1 text-white"></i>
              </div>
              <h4 className="text-white mb-3">Vast Library</h4>
              <p className="text-muted">
                Access of manga and webtoons across all genres
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="feature-icon bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-phone fs-1 text-white"></i>
              </div>
              <h4 className="text-white mb-3">Mobile Friendly</h4>
              <p className="text-muted">
                Read anywhere, anytime on any device with responsive design
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="feature-icon bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-lightning-charge fs-1 text-white"></i>
              </div>
              <h4 className="text-white mb-3">Fast Updates</h4>
              <p className="text-muted">
                Get the latest chapters as soon as released
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 bg-gradient" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #8b0000 100%)' }}>
        <div className="container text-center">
          <h2 className="text-white fw-bold mb-3">Ready to Start Reading?</h2>
          <p className="text-white mb-4 fs-5">
            Join thousands of readers and dive into amazing stories
          </p>
          <Link to="/register" className="btn btn-light btn-lg px-5">
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
