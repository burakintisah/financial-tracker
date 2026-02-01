/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize the Supabase client
const supabaseClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export { supabaseClient };

export default supabaseClient;
