import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnalysisDashboard } from './pages/AnalysisDashboard';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SnapshotsPage } from './pages/SnapshotsPage';
import { SnapshotDetailPage } from './pages/SnapshotDetailPage';
import { CreateSnapshotPage } from './pages/CreateSnapshotPage';

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

function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="bg-navy-900 border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <span className="text-gold-400">📊</span>
            <span>Financial Tracker</span>
          </Link>
          <div className="flex gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isHome
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'text-navy-200 hover:text-white hover:bg-navy-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'text-navy-200 hover:text-white hover:bg-navy-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/analysis'
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'text-navy-200 hover:text-white hover:bg-navy-800'
              }`}
            >
              Stock Analysis
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gold-500 text-navy-900 hover:bg-gold-400 transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await axios.get<HealthStatus>(`${apiUrl}/api/health`);
        setHealth(response.data);
        setError(null);
      } catch (err) {
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="text-gold-400">📊</span> Financial Tracker
          </h1>
          <p className="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto">
            Take control of your finances. Track accounts, investments, and watch your wealth grow.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* API Status Card */}
          <div className="bg-navy-800/80 backdrop-blur-lg rounded-xl p-6 mb-8 border border-navy-700">
            <h2 className="text-lg font-semibold text-white mb-3">API Status</h2>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold-400 border-t-transparent" />
                <span className="text-navy-200">Checking API status...</span>
              </div>
            ) : health ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 font-medium">{health.message}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span className="text-red-400">{error}</span>
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-navy-800/80 backdrop-blur-lg rounded-xl p-6 border border-navy-700 hover:border-navy-600 transition-all duration-300 hover:shadow-lg hover:shadow-navy-900/50"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-navy-300 mb-4">{feature.description}</p>
                {feature.link && (
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 font-medium transition-colors"
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
          <div className="bg-gradient-to-r from-navy-800 to-navy-700 backdrop-blur-lg rounded-xl p-8 border border-gold-500/30 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              <span className="text-gold-400">🚀</span> Get Started
            </h2>
            <p className="text-navy-200 mb-6">
              Sign in with Google to start tracking your finances and investments.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
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

function AppContent() {
  const location = useLocation();
  const isAnalysisPage = location.pathname === '/analysis';
  const isProtectedPage = ['/dashboard', '/snapshots', '/snapshots/new'].includes(location.pathname) ||
    location.pathname.startsWith('/snapshots/');
  const isLoginPage = location.pathname === '/login';
  const showNavigation = !isAnalysisPage && !isProtectedPage && !isLoginPage;

  return (
    <div className={`min-h-screen ${isAnalysisPage || isProtectedPage ? 'bg-slate-50' : 'bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800'}`}>
      {showNavigation && <Navigation />}

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
      {showNavigation && (
        <footer className="py-6 px-4 bg-navy-950 border-t border-navy-800">
          <div className="max-w-4xl mx-auto text-center text-sm">
            <p className="text-navy-400">
              Financial Tracker &copy; {new Date().getFullYear()}
            </p>
            <p className="mt-1 text-navy-500">
              by Burak Intisah
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
