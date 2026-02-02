/**
 * Login Page
 * Authentication page with consistent theme support
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, themeClasses, getThemeClass } from '../contexts/ThemeContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${getThemeClass(themeClasses.pageBg, isDark)}`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">📊</span>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy-800'}`}>
              Financial Tracker
            </span>
          </Link>
          <p className={`mt-2 ${isDark ? 'text-navy-300' : 'text-slate-600'}`}>
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div className={`rounded-xl p-8 border ${getThemeClass(themeClasses.card, isDark)}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-navy-200' : 'text-slate-700'}`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${getThemeClass(themeClasses.input, isDark)}`}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-navy-200' : 'text-slate-700'}`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${getThemeClass(themeClasses.input, isDark)}`}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getThemeClass(themeClasses.button.primary, isDark)}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className={`flex-1 border-t ${isDark ? 'border-navy-600' : 'border-slate-200'}`} />
            <span className={`px-4 text-sm ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>or</span>
            <div className={`flex-1 border-t ${isDark ? 'border-navy-600' : 'border-slate-200'}`} />
          </div>

          {/* Continue without login */}
          <Link
            to="/analysis"
            className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-colors ${getThemeClass(themeClasses.button.secondary, isDark)}`}
          >
            Continue as Guest
          </Link>
        </div>

        {/* Back to Home */}
        <p className={`mt-6 text-center text-sm ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
          <Link to="/" className={`${isDark ? 'text-gold-400 hover:text-gold-300' : 'text-navy-600 hover:text-navy-800'}`}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
