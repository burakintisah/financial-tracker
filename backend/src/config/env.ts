/**
 * Environment Configuration and Validation
 * Ensures all required environment variables are set at startup
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  ALLOWED_ORIGINS: string[];

  // Demo Mode
  DEMO_MODE: boolean;

  // Auth
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;

  // Database (optional in demo mode)
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Gemini AI (optional in demo mode)
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  // Cache
  CACHE_TTL_HOURS: number;

  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: number;
}

function validateEnv(): { demoMode: boolean; hasSupabase: boolean } {
  // Check if demo mode is explicitly enabled or if API keys are missing
  const explicitDemoMode = process.env.DEMO_MODE === 'true';
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  const hasGemini = !!process.env.GEMINI_API_KEY;

  // Auto-enable demo mode if Gemini key is missing
  const demoMode = explicitDemoMode || !hasGemini;

  console.log('='.repeat(60));
  console.log('📊 Financial Tracker - Stock Analysis API');
  console.log('='.repeat(60));

  if (demoMode) {
    console.log('🎮 AI MODE: Demo (mock responses)');
  } else {
    console.log('🤖 AI MODE: Gemini API');
  }

  if (hasSupabase) {
    console.log('💾 DATABASE: Supabase connected');
  } else {
    console.log('⚠️  DATABASE: Not configured (no caching)');
  }

  if (!hasGemini && !explicitDemoMode) {
    console.log('');
    console.log('To enable real AI analysis:');
    console.log('  GEMINI_API_KEY=your-gemini-api-key');
    console.log('  Get your free API key at: https://aistudio.google.com/apikey');
  }

  console.log('='.repeat(60));

  return { demoMode, hasSupabase };
}

function parseOrigins(origins: string | undefined): string[] {
  if (!origins) {
    return ['http://localhost:5173'];
  }
  return origins.split(',').map((origin) => origin.trim());
}

function getEnvConfig(): EnvConfig {
  const { demoMode } = validateEnv();

  return {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    ALLOWED_ORIGINS: parseOrigins(process.env.ALLOWED_ORIGINS),

    // Demo Mode
    DEMO_MODE: demoMode,

    // Auth
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

    // Database (empty strings if not set)
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Gemini AI (empty if not set)
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',

    // Cache
    CACHE_TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),

    // Rate Limiting
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10', 10),
  };
}

export const env = getEnvConfig();

export default env;
