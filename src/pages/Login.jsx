import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { loginAdmin } from '../utils/auth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || null;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Try admin login first (local admin)
    const adminResult = loginAdmin(formData.email, formData.password);
    if (adminResult.success) {
      setTimeout(() => {
        setLoading(false);
        if (fromPath) {
          navigate(fromPath, { replace: true });
        } else {
          navigate('/admin');
        }
      }, 500);
      return;
    }

    // Use AuthProvider login (handles Firebase or local fallback)
    try {
      const result = await login(formData.email, formData.password);

      setTimeout(() => {
        setLoading(false);
        // For Firebase, login returns a userCredential (has user); for local fallback returns { success: true, user }
        if ((result && result.success) || (result && result.user) || result?.user) {
          if (fromPath) {
            navigate(fromPath, { replace: true });
          } else {
            navigate('/dashboard');
          }
        } else if (result && result.success === false) {
          setError(result.message || 'Login failed');
        } else {
          // Assume success
          if (fromPath) {
            navigate(fromPath, { replace: true });
          } else {
            navigate('/dashboard');
          }
        }
      }, 500);
    } catch (err) {
      setLoading(false);
      setError(err.message || String(err));
    }
  }; 

  return (
    <div className="min-vh-100 d-flex align-items-center bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card bg-dark-subtle border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">
                    <span className="text-danger">📚</span> Welcome Back
                  </h2>
                  <p className="text-muted">Login to continue reading</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-danger btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-2">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="text-danger text-decoration-none">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <Link to="/" className="text-light text-decoration-none">
                <i className="bi bi-arrow-left"></i> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
