/**
 * Claude AI Client Configuration
 * Initializes and exports the Anthropic client for AI-powered stock analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

// Initialize the Anthropic client
// The API key is validated in env.ts at startup
const anthropicClient = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export const claudeConfig = {
  model: env.ANTHROPIC_MODEL,
  maxTokens: env.ANTHROPIC_MAX_TOKENS,
};

export { anthropicClient };

export default anthropicClient;
