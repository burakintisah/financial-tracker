/**
 * Claude AI Client Configuration
 * Initializes and exports the Anthropic client for AI-powered stock analysis
 * In demo mode, client is not initialized
 */

import { env } from './env';

export const claudeConfig = {
  model: env.ANTHROPIC_MODEL,
  maxTokens: env.ANTHROPIC_MAX_TOKENS,
  isDemoMode: env.DEMO_MODE,
};

// Note: Anthropic client is dynamically imported in claude-ai.service.ts
// to avoid initialization errors in demo mode

export default claudeConfig;
