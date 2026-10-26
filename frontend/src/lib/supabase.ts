// Supabase Client Initialization with Offline Graceful Fallback
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10 &&
  !supabaseUrl.includes('your-project')
);

// If unconfigured, initialize with safe mock URL to prevent crash while alerting user
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://mock-unconfigured-project.supabase.co', 'mock-anon-key-local-only', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ NammaSeve: Supabase credentials not yet provided in frontend/.env. The app is running with local state and graceful empty-state handling. Enter your real keys in frontend/.env when ready.'
  );
}
