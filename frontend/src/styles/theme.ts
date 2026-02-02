/**
 * Theme Constants & Utilities
 * Centralized theme configuration for consistent styling across the app
 *
 * Usage:
 * - Import theme constants in components
 * - Use with Tailwind classes or as reference
 * - Extend for new pages by following the patterns
 */

// ============================================
// PAGE BACKGROUNDS
// ============================================
export const pageBackgrounds = {
  // Dark theme (Home, Dashboard pages)
  dark: 'bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800',
  // Light theme (Analysis, Detail pages)
  light: 'bg-slate-50',
} as const;

// ============================================
// NAVIGATION
// ============================================
export const nav = {
  base: 'bg-navy-900 border-b border-navy-800',
  link: {
    active: 'bg-navy-700 text-white shadow-sm',
    inactive: 'text-navy-200 hover:text-white hover:bg-navy-800',
  },
} as const;

// ============================================
// CARDS
// ============================================
export const cards = {
  // Dark theme cards (for dark backgrounds)
  dark: {
    base: 'bg-navy-800/80 backdrop-blur-lg rounded-xl border border-navy-700',
    hover: 'hover:border-navy-600 hover:shadow-lg hover:shadow-navy-900/50',
  },
  // Light theme cards (for light backgrounds)
  light: {
    base: 'bg-white rounded-xl shadow-sm border border-slate-200',
    hover: 'hover:shadow-md hover:border-slate-300',
  },
} as const;

// ============================================
// BUTTONS
// ============================================
export const buttons = {
  // Primary action button
  primary: {
    base: 'px-4 py-2 rounded-lg font-medium transition-colors',
    enabled: 'bg-navy-800 text-white hover:bg-navy-700',
    disabled: 'bg-slate-200 text-slate-500 cursor-not-allowed',
  },
  // Secondary/ghost button
  secondary: {
    base: 'px-4 py-2 rounded-lg font-medium transition-colors',
    enabled: 'bg-navy-50 text-navy-700 hover:bg-navy-100',
    disabled: 'bg-slate-100 text-slate-400 cursor-not-allowed',
  },
  // Outline button
  outline: {
    base: 'px-4 py-2 rounded-lg font-medium transition-colors border',
    enabled: 'border-navy-300 text-navy-700 hover:bg-navy-50',
    disabled: 'border-slate-200 text-slate-400 cursor-not-allowed',
  },
  // Text/link button
  text: {
    base: 'px-4 py-2 rounded-lg text-sm transition-colors',
    enabled: 'text-navy-600 hover:text-navy-800 hover:bg-navy-50',
    disabled: 'text-slate-400 cursor-not-allowed',
  },
  // Gold accent button (CTAs)
  accent: {
    base: 'px-4 py-2 rounded-lg font-medium transition-colors',
    enabled: 'bg-gold-500 text-navy-900 hover:bg-gold-400',
    disabled: 'bg-gold-200 text-gold-600 cursor-not-allowed',
  },
} as const;

// ============================================
// TEXT COLORS
// ============================================
export const text = {
  // Dark theme text (on dark backgrounds)
  dark: {
    primary: 'text-white',
    secondary: 'text-navy-200',
    muted: 'text-navy-300',
    subtle: 'text-navy-400',
  },
  // Light theme text (on light backgrounds)
  light: {
    primary: 'text-navy-800',
    secondary: 'text-slate-600',
    muted: 'text-slate-500',
    subtle: 'text-slate-400',
  },
} as const;

// ============================================
// STATUS COLORS
// ============================================
export const status = {
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
    icon: 'text-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    icon: 'text-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-400',
    icon: 'text-red-500',
  },
  info: {
    bg: 'bg-navy-50',
    text: 'text-navy-700',
    border: 'border-navy-200',
    dot: 'bg-navy-400',
    icon: 'text-navy-500',
  },
} as const;

// ============================================
// BADGES
// ============================================
export const badges = {
  bullish: 'bg-emerald-100 text-emerald-800',
  bearish: 'bg-red-100 text-red-800',
  neutral: 'bg-slate-100 text-slate-800',
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
} as const;

// ============================================
// TABS
// ============================================
export const tabs = {
  container: 'border-b border-slate-200',
  tab: {
    base: 'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
    active: 'border-navy-700 text-navy-800',
    inactive: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
  },
  badge: {
    active: 'bg-navy-100 text-navy-700',
    inactive: 'bg-slate-100 text-slate-600',
  },
} as const;

// ============================================
// INPUTS
// ============================================
export const inputs = {
  base: 'w-full px-4 py-2 rounded-lg border transition-colors',
  default: 'border-slate-300 focus:border-navy-500 focus:ring-1 focus:ring-navy-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500',
} as const;

// ============================================
// FOOTER
// ============================================
export const footer = {
  dark: 'bg-navy-950 border-t border-navy-800 text-navy-400',
  light: 'bg-slate-100 border-t border-slate-200 text-slate-600',
} as const;

// ============================================
// MODALS
// ============================================
export const modal = {
  overlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
  container: 'bg-white rounded-2xl shadow-xl',
  header: 'sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl',
  footer: 'sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl',
} as const;

// ============================================
// HERO SECTIONS
// ============================================
export const hero = {
  dark: 'bg-navy-900 text-white',
  gradient: 'bg-gradient-to-r from-navy-900 to-navy-800 text-white',
} as const;

// ============================================
// INFO BANNERS
// ============================================
export const banner = {
  info: 'bg-navy-50 border border-navy-200 text-navy-700',
  success: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border border-amber-200 text-amber-700',
  error: 'bg-red-50 border border-red-200 text-red-700',
} as const;

// ============================================
// LOADING STATES
// ============================================
export const loading = {
  spinner: 'border-navy-700 border-t-transparent',
  skeleton: 'bg-slate-200 animate-pulse',
  skeletonDark: 'bg-navy-700 animate-pulse',
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Combines button classes based on state
 */
export function getButtonClasses(
  variant: keyof typeof buttons,
  disabled: boolean = false
): string {
  const btn = buttons[variant];
  return `${btn.base} ${disabled ? btn.disabled : btn.enabled}`;
}

/**
 * Gets status classes for a given status type
 */
export function getStatusClasses(
  statusType: keyof typeof status,
  element: 'bg' | 'text' | 'border' | 'dot' | 'icon'
): string {
  return status[statusType][element];
}

/**
 * Gets card classes based on theme
 */
export function getCardClasses(theme: 'dark' | 'light', withHover: boolean = true): string {
  const card = cards[theme];
  return withHover ? `${card.base} ${card.hover} transition-all` : card.base;
}
