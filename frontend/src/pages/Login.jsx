import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/index.js';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(form);
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userName', user.name || '');
      localStorage.setItem('userEmail', user.email || '');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 brand-chip rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-slate-900 text-2xl font-bold">Welcome back</h1>
          <p className="text-muted text-sm mt-1">Sign in to continue to Slotted</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-muted text-sm mb-1.5 block">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-700 hover:text-teal-800 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
