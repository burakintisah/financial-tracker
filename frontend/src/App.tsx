import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AnalysisDashboard } from './pages/AnalysisDashboard';

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
              to="/analysis"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isHome
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Stock Analysis
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

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-8 border border-yellow-400/30 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">🚀 Coming Soon</h2>
            <p className="text-blue-100 mb-4">
              We're building something amazing! Soon you'll be able to:
            </p>
            <ul className="text-left inline-block text-blue-100 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span> Import data from Excel files
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span> View interactive charts and reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span> Track multiple currencies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span> Compare snapshots over time
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAnalysisPage = location.pathname === '/analysis';

  return (
    <div className={`min-h-screen ${isAnalysisPage ? 'bg-gray-50' : 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800'}`}>
      {!isAnalysisPage && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalysisDashboard />} />
      </Routes>

      {/* Footer */}
      <footer className={`py-6 px-4 ${isAnalysisPage ? 'bg-gray-100 border-t border-gray-200' : 'border-t border-white/10'}`}>
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p className={isAnalysisPage ? 'text-gray-600' : 'text-blue-200'}>
            Financial Tracker &copy; {new Date().getFullYear()}
          </p>
          <p className={`mt-1 ${isAnalysisPage ? 'text-gray-500' : 'text-blue-200'}`}>
            by Burak Intisah
          </p>
          {isAnalysisPage && (
            <Link
              to="/"
              className="mt-2 inline-block text-blue-600 hover:text-blue-800"
            >
              Back to Home
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
