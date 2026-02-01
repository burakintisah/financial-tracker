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

  // Database (optional in demo mode)
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Claude AI (optional in demo mode)
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  ANTHROPIC_MAX_TOKENS: number;

  // Cache
  CACHE_TTL_HOURS: number;

  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: number;
}

function validateEnv(): { demoMode: boolean } {
  // Check if demo mode is explicitly enabled or if API keys are missing
  const explicitDemoMode = process.env.DEMO_MODE === 'true';
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  // Auto-enable demo mode if keys are missing
  const demoMode = explicitDemoMode || !hasAnthropic;

  if (demoMode) {
    console.log('='.repeat(60));
    console.log('🎮 DEMO MODE ENABLED');
    console.log('='.repeat(60));

    if (!hasAnthropic) {
      console.log('⚠️  ANTHROPIC_API_KEY not set - using mock AI responses');
    }
    if (!hasSupabase) {
      console.log('⚠️  Supabase not configured - caching disabled');
    }

    console.log('');
    console.log('To enable full functionality, set these in .env:');
    if (!hasAnthropic) {
      console.log('  ANTHROPIC_API_KEY=sk-ant-api03-...');
    }
    if (!hasSupabase) {
      console.log('  SUPABASE_URL=https://xxx.supabase.co');
      console.log('  SUPABASE_ANON_KEY=eyJ...');
    }
    console.log('='.repeat(60));
  } else {
    // Validate API key format when not in demo mode
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (apiKey && !apiKey.startsWith('sk-ant-')) {
      console.warn(
        'Warning: ANTHROPIC_API_KEY does not start with "sk-ant-". ' +
        'Please verify your API key is correct.'
      );
    }
  }

  return { demoMode };
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

    // Database (empty strings if not set)
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Claude AI (empty if not set)
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    ANTHROPIC_MAX_TOKENS: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2000', 10),

    // Cache
    CACHE_TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),

    // Rate Limiting
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10', 10),
  };
}

export const env = getEnvConfig();

export default env;
