import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// AdminLogin has been consolidated into the main Login page.
// This stub redirects anyone trying the old admin-login route to the unified login page.
export default function AdminLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
}
