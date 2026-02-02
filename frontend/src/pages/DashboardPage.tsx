/**
 * Dashboard Page
 * Main dashboard after user login
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, themeClasses, getThemeClass } from '../contexts/ThemeContext';

const quickActions = [
  {
    icon: '📈',
    title: 'Stock Analysis',
    description: 'AI-powered stock predictions',
    link: '/analysis',
  },
  {
    icon: '💰',
    title: 'Portfolio',
    description: 'Track your investments',
    link: '#',
    comingSoon: true,
  },
  {
    icon: '📊',
    title: 'Reports',
    description: 'Financial reports & insights',
    link: '#',
    comingSoon: true,
  },
  {
    icon: '⚙️',
    title: 'Settings',
    description: 'Account preferences',
    link: '#',
    comingSoon: true,
  },
];

const recentActivity = [
  { type: 'analysis', title: 'AAPL Stock Analysis', time: '2 hours ago' },
  { type: 'analysis', title: 'GOOGL Stock Analysis', time: '5 hours ago' },
  { type: 'login', title: 'Account Login', time: '1 day ago' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-navy-800'}`}>
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className={`mt-2 ${isDark ? 'text-navy-300' : 'text-slate-600'}`}>
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-navy-300' : 'text-slate-500'}`}>Total Portfolio</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-navy-800'}`}>$24,500</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <span className="text-2xl">💵</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500">↑ 12.5%</span>
            <span className={`ml-2 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-navy-300' : 'text-slate-500'}`}>Analyses Today</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-navy-800'}`}>7</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gold-500/20' : 'bg-gold-100'}`}>
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gold-500">↑ 3</span>
            <span className={`ml-2 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>new analyses</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-navy-300' : 'text-slate-500'}`}>Watchlist</p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-navy-800'}`}>12</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-navy-600' : 'bg-navy-100'}`}>
              <span className="text-2xl">👁️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={isDark ? 'text-navy-400' : 'text-slate-500'}>Stocks tracked</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-navy-800'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`rounded-xl p-5 border transition-all ${getThemeClass(themeClasses.card, isDark)} ${
                action.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
              onClick={(e) => action.comingSoon && e.preventDefault()}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-navy-800'}`}>
                {action.title}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
                {action.description}
              </p>
              {action.comingSoon && (
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-100 text-gold-700'
                }`}>
                  Coming Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-navy-800'}`}>
          Recent Activity
        </h2>
        <div className={`rounded-xl border overflow-hidden ${getThemeClass(themeClasses.card, isDark)}`}>
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 ${
                index !== recentActivity.length - 1
                  ? isDark ? 'border-b border-navy-700' : 'border-b border-slate-200'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'analysis'
                    ? isDark ? 'bg-gold-500/20' : 'bg-gold-100'
                    : isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  {activity.type === 'analysis' ? '📊' : '🔐'}
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-navy-800'}`}>
                    {activity.title}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
                    {activity.time}
                  </p>
                </div>
              </div>
              <button className={`text-sm ${isDark ? 'text-gold-400 hover:text-gold-300' : 'text-navy-600 hover:text-navy-800'}`}>
                View →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
