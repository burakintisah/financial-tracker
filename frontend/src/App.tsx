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
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <span>💰</span>
            <span>Financial Tracker</span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHome
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/analysis'
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Stock Analysis
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors"
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
            💰 Financial Tracker
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Take control of your finances. Track accounts, investments, and watch your wealth grow.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* API Status Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">API Status</h2>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span className="text-blue-100">Checking API status...</span>
              </div>
            ) : health ? (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 font-medium">{health.message}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span className="text-red-300">{error}</span>
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-100 mb-4">{feature.description}</p>
                {feature.link && (
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-100 font-medium"
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
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-400/30 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">🚀 Get Started</h2>
            <p className="text-blue-100 mb-6">
              Sign in with Google to start tracking your finances and investments.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
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
  const showGradientBackground = !isAnalysisPage && !isProtectedPage && !isLoginPage;

  return (
    <div className={`min-h-screen ${showGradientBackground ? 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800' : 'bg-gray-50'}`}>
      {showGradientBackground && <Navigation />}

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
      {showGradientBackground && (
        <footer className="py-6 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center text-sm">
            <p className="text-blue-200">
              Financial Tracker &copy; {new Date().getFullYear()}
            </p>
            <p className="mt-1 text-blue-200">
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
