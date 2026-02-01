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

  // Database
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Claude AI
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  ANTHROPIC_MAX_TOKENS: number;

  // Cache
  CACHE_TTL_HOURS: number;

  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: number;
}

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ANTHROPIC_API_KEY',
] as const;

function validateEnv(): void {
  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate ANTHROPIC_API_KEY format (basic check)
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (apiKey && !apiKey.startsWith('sk-ant-')) {
    console.warn(
      'Warning: ANTHROPIC_API_KEY does not start with "sk-ant-". ' +
      'Please verify your API key is correct.'
    );
  }
}

function parseOrigins(origins: string | undefined): string[] {
  if (!origins) {
    return ['http://localhost:5173'];
  }
  return origins.split(',').map((origin) => origin.trim());
}

function getEnvConfig(): EnvConfig {
  validateEnv();

  return {
    // Server
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    ALLOWED_ORIGINS: parseOrigins(process.env.ALLOWED_ORIGINS),

    // Database
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Claude AI
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
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
