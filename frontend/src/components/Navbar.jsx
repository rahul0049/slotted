import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from '../api/index.js';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data.user))
        .catch(() => {});
    }
  }, [token]);

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { await authAPI.logout(refreshToken); } catch {}
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f9f2e6]/90 backdrop-blur-md border-b border-[#d7c8ae]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 brand-chip rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-slate-900 font-semibold text-lg">Slotted</span>
        </Link>

        
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm hidden sm:block">{user.name || user.email}</span>
              <button
                onClick={logout}
                className="text-muted hover:text-slate-900 text-sm transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white text-sm font-medium">
                {(user.name || user.email)?.[0]?.toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-muted hover:text-slate-900 text-sm transition-colors px-3 py-1.5">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
