import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BurgerMenu } from './components/BurgerMenu';
import { AnalysisDashboard } from './pages/AnalysisDashboard';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SnapshotsPage } from './pages/SnapshotsPage';
import { SnapshotDetailPage } from './pages/SnapshotDetailPage';
import { CreateSnapshotPage } from './pages/CreateSnapshotPage';
import { ThemeProvider, useTheme, themeClasses, getThemeClass } from './contexts/ThemeContext';

interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

const features: FeatureCard[] = [
  {
    icon: '📊',
    title: 'Track Everything',
    description: 'Monitor all your bank accounts, investments, and crypto in one place.',
    link: '/dashboard',
  },
  {
    icon: '🤖',
    title: 'AI Stock Analysis',
    description: 'Get AI-powered insights on stocks from BIST and US markets.',
    link: '/analysis',
  },
  {
    icon: '📈',
    title: 'Visualize Trends',
    description: 'See how your wealth grows over time with beautiful charts.',
    link: '/dashboard',
  },
];

// Theme Toggle Button Component
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDark
          ? 'bg-navy-700 hover:bg-navy-600 text-gold-400'
          : 'bg-slate-100 hover:bg-slate-200 text-navy-600'
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// Top Bar Component - Always visible on all pages
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Check if we're on a page that needs compact navigation (login page)
  const isLoginPage = location.pathname === '/login';

  return (
    <nav className={getThemeClass(themeClasses.nav, isDark)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Burger Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Burger Menu Button */}
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-navy-700 text-navy-200'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${isDark ? 'text-white' : 'text-navy-800'}`}>
              <span className="text-gold-400">📊</span>
              <span className="hidden sm:inline">Financial Tracker</span>
            </Link>
          </div>

          {/* Right side: Desktop Navigation + Theme Toggle + Login/User */}
          <div className="flex items-center gap-2">
            {/* Desktop Navigation Links - hidden on mobile */}
            {!isLoginPage && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/')
                      ? isDark ? 'bg-navy-700 text-white' : 'bg-slate-200 text-navy-800'
                      : isDark ? 'text-navy-200 hover:text-white hover:bg-navy-800' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? isDark ? 'bg-navy-700 text-white' : 'bg-slate-200 text-navy-800'
                      : isDark ? 'text-navy-200 hover:text-white hover:bg-navy-800' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/analysis"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/analysis')
                      ? isDark ? 'bg-navy-700 text-white' : 'bg-slate-200 text-navy-800'
                      : isDark ? 'text-navy-200 hover:text-white hover:bg-navy-800' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                  }`}
                >
                  Stock Analysis
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/snapshots"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive('/snapshots') || location.pathname.startsWith('/snapshots/')
                        ? isDark ? 'bg-navy-700 text-white' : 'bg-slate-200 text-navy-800'
                        : isDark ? 'text-navy-200 hover:text-white hover:bg-navy-800' : 'text-slate-600 hover:text-navy-800 hover:bg-slate-100'
                    }`}
                  >
                    Snapshots
                  </Link>
                )}

                {/* Divider */}
                <div className={`w-px h-6 mx-2 ${isDark ? 'bg-navy-700' : 'bg-slate-200'}`} />
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Login/User Button */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getThemeClass(themeClasses.button.primary, isDark)}`}
              >
                Login
              </Link>
            ) : (
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isDark ? 'bg-navy-700' : 'bg-slate-100'
              }`}>
                <div className={`w-2 h-2 rounded-full bg-emerald-400`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-navy-800'}`}>
                  Logged In
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Home Page Component
function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await axios.get<HealthStatus>(`${apiUrl}/api/health`);
        setHealth(response.data);
        setError(null);
      } catch {
        setError('API is not available');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-navy-800'}`}>
            <span className="text-gold-400">📊</span> Financial Tracker
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? 'text-navy-200' : 'text-slate-600'}`}>
            Take control of your finances. Track accounts, investments, and watch your wealth grow.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${getThemeClass(themeClasses.button.primary, isDark)}`}
            >
              Get Started
            </Link>
            <Link
              to="/analysis"
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${getThemeClass(themeClasses.button.secondary, isDark)}`}
            >
              Try Stock Analysis
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* API Status Card */}
          <div className={`rounded-xl p-6 mb-8 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <h2 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-navy-800'}`}>API Status</h2>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className={`animate-spin rounded-full h-5 w-5 border-2 border-t-transparent ${isDark ? 'border-gold-400' : 'border-navy-600'}`} />
                <span className={isDark ? 'text-navy-200' : 'text-slate-600'}>Checking API status...</span>
              </div>
            ) : health ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-500 font-medium">{health.message}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span className="text-red-500">{error}</span>
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] ${getThemeClass(themeClasses.card, isDark)}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-navy-800'}`}>{feature.title}</h3>
                <p className={`mb-4 ${isDark ? 'text-navy-300' : 'text-slate-600'}`}>{feature.description}</p>
                {feature.link && (
                  <Link
                    to={feature.link}
                    className={`inline-flex items-center gap-1 font-medium transition-colors ${
                      isDark ? 'text-gold-400 hover:text-gold-300' : 'text-navy-600 hover:text-navy-800'
                    }`}
                  >
                    Try Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Get Started Section */}
          <div className={`rounded-xl p-8 border text-center ${
            isDark
              ? 'bg-gradient-to-r from-navy-800 to-navy-700 border-gold-500/30'
              : 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-navy-800'}`}>
              <span className="text-gold-400">🚀</span> Get Started
            </h2>
            <p className={`mb-6 ${isDark ? 'text-navy-200' : 'text-slate-600'}`}>
              Sign in with Google to start tracking your finances and investments.
            </p>
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${getThemeClass(themeClasses.button.primary, isDark)}`}
            >
              <span>Sign In with Google</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// App Content Component
function AppContent() {
  const location = useLocation();
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  // Show footer only on home page
  const showFooter = isHomePage;

  return (
    <div className={`min-h-screen ${getThemeClass(themeClasses.pageBg, isDark)}`}>
      {/* Top Bar - Always visible */}
      <TopBar onMenuClick={() => setIsMenuOpen(true)} />

      {/* Burger Menu */}
      <BurgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Main Content */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/analysis" element={<AnalysisDashboard />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snapshots"
          element={
            <ProtectedRoute>
              <SnapshotsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snapshots/new"
          element={
            <ProtectedRoute>
              <CreateSnapshotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snapshots/:id"
          element={
            <ProtectedRoute>
              <SnapshotDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer */}
      {showFooter && (
        <footer className={`py-6 px-4 ${getThemeClass(themeClasses.footer, isDark)}`}>
          <div className="max-w-4xl mx-auto text-center text-sm">
            <p className={isDark ? 'text-navy-400' : 'text-slate-600'}>
              Financial Tracker &copy; {new Date().getFullYear()}
            </p>
            <p className={`mt-1 ${isDark ? 'text-navy-500' : 'text-slate-500'}`}>
              by Burak Intisah
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
