import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function MangaCard({ manga }) {
  return (
    <div className="col">
      <Link to={`/manga/${manga.id}`} className="text-decoration-none">
        <div className="card manga-card h-100 bg-dark text-light border-0 shadow-sm">
          <div className="manga-card-image">
            <img
              src={manga.coverImage}
              className="card-img-top"
              alt={manga.title}
              style={{ height: '350px', objectFit: 'cover' }}
            />
            {manga.isTrending && (
              <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                🔥 Trending
              </span>
            )}
            {manga.status === 'Completed' && (
              <span className="badge bg-success position-absolute top-0 end-0 m-2">
                Completed
              </span>
            )}
          </div>

          <div className="card-body">
            <h6 className="card-title fw-bold text-truncate">{manga.title}</h6>
            <p className="card-text small text-muted mb-2">
              {manga.genres.slice(0, 2).join(', ')}
            </p>

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-1">
                <i className="bi bi-star-fill text-warning"></i>
                <span className="small">{manga.rating}</span>
              </div>
              <span className="small text-muted">
                <i className="bi bi-eye"></i> {manga.views}
              </span>
            </div>
          </div>

          <div className="card-footer bg-transparent border-0 pt-0">
            <button className="btn btn-sm btn-outline-danger w-100">
              Read Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

MangaCard.propTypes = {
  manga: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    coverImage: PropTypes.string,
    title: PropTypes.string,
    isTrending: PropTypes.bool,
    status: PropTypes.string,
    genres: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    views: PropTypes.string
  }).isRequired
};

export default MangaCard;
