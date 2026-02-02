/**
 * Burger Menu Component
 * Slide-out sidebar navigation for authenticated pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, themeClasses, getThemeClass } from '../contexts/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analysis', label: 'Stock Analysis', icon: '📈' },
    { path: '/snapshots', label: 'Snapshots', icon: '📋' },
    { path: '/snapshots/new', label: 'New Snapshot', icon: '➕' },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-navy-900 border-r border-navy-700'
            : 'bg-white border-r border-slate-200'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-navy-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center gap-2 font-bold text-lg ${
                isDark ? 'text-white' : 'text-navy-800'
              }`}
            >
              <span className="text-gold-400">📊</span>
              <span>Financial Tracker</span>
            </Link>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-navy-800 text-navy-300'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-navy-800' : 'bg-slate-50'}`}>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-navy-800'}`}>
                {user.name}
              </p>
              <p className={`text-sm ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? isDark
                        ? 'bg-navy-700 text-white'
                        : 'bg-slate-200 text-navy-800'
                      : isDark
                        ? 'text-navy-300 hover:bg-navy-800 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-navy-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-navy-700' : 'border-slate-200'}`}>
          {user ? (
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isDark
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${getThemeClass(themeClasses.button.primary, isDark)}`}
            >
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;
