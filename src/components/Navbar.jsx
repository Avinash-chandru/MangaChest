import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isAuthenticated, getCurrentUser, logout, isAdmin } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  const [navHidden, setNavHidden] = useState(false);
  const prevScroll = useRef(typeof window !== 'undefined' ? window.pageYOffset : 0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.pageYOffset;
      if (current > prevScroll.current && current > 80) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      prevScroll.current = current <= 0 ? 0 : current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  }; 

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow ${navHidden ? 'hide-on-scroll' : ''}`}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="text-danger">📚</span> MangaChest
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            {authenticated && !userIsAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item ms-2">
              <Link className="nav-link" to="/library">Library</Link>
            </li>
            {userIsAdmin && (
              <li className="nav-item ms-2">
                <Link className="nav-link text-warning" to="/admin">Admin Panel</Link>
              </li>
            )}
            {authenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={user?.avatar}
                    alt="avatar"
                    className="rounded-circle me-2"
                    width="30"
                    height="30"
                  />
                  {user?.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {!userIsAdmin && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/dashboard">
                          <i className="bi bi-person"></i> Profile
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-danger btn-sm ms-2" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
