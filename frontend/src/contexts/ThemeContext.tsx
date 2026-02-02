/**
 * Theme Context
 * Manages dark/light mode across the application
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Update document class for global styling
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme utility classes
export const themeClasses = {
  // Page backgrounds
  pageBg: {
    light: 'bg-slate-50',
    dark: 'bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800',
  },
  // Cards
  card: {
    light: 'bg-white border-slate-200 shadow-sm',
    dark: 'bg-navy-800/80 backdrop-blur-lg border-navy-700',
  },
  // Text
  text: {
    primary: { light: 'text-navy-800', dark: 'text-white' },
    secondary: { light: 'text-slate-600', dark: 'text-navy-200' },
    muted: { light: 'text-slate-500', dark: 'text-navy-300' },
  },
  // Buttons
  button: {
    primary: {
      light: 'bg-navy-800 text-white hover:bg-navy-700',
      dark: 'bg-gold-500 text-navy-900 hover:bg-gold-400',
    },
    secondary: {
      light: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      dark: 'bg-navy-700 text-white hover:bg-navy-600',
    },
  },
  // Navigation
  nav: {
    light: 'bg-white border-b border-slate-200',
    dark: 'bg-navy-900 border-b border-navy-800',
  },
  // Footer
  footer: {
    light: 'bg-slate-100 border-t border-slate-200',
    dark: 'bg-navy-950 border-t border-navy-800',
  },
  // Inputs
  input: {
    light: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-navy-500 focus:ring-navy-500',
    dark: 'bg-navy-800 border-navy-600 text-white placeholder-navy-400 focus:border-gold-500 focus:ring-gold-500',
  },
};

// Helper to get theme-aware classes
export function getThemeClass(
  classes: { light: string; dark: string },
  isDark: boolean
): string {
  return isDark ? classes.dark : classes.light;
}
