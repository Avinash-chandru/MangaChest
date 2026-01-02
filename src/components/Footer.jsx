import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">
              <span className="text-danger">📚</span> MangaChest
            </h5>
            <p className="text-muted">
              Your ultimate destination for reading manga and webtoons online.
              Dive into thousands of stories across all genres.
            </p>
          </div>

          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/library" className="text-muted text-decoration-none">Library</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none">Login</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Genres</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <span className="text-muted">Action</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Romance</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Fantasy</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Slice of Life</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Comedy</span>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Connect</h6>
            <div className="d-flex gap-3">
              <a href="https://www.instagram.com/ani.arts.0_0/#" className="text-muted fs-4">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted mb-0">
              &copy; 2026 MangaChest. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-muted mb-0">
              Made with ❤️ for manga lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
