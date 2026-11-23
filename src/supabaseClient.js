import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  typeof rawUrl === 'string' &&
  typeof rawKey === 'string' &&
  /^https?:\/\//i.test(rawUrl.trim())
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Warning: Missing or invalid Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). The application is running in offline fallback mode with local content.'
  );
}

// Fallback placeholder credentials prevent createClient() from throwing at bundle startup.
// This allows the React application to mount safely and utilize local fallback data when unconfigured.
const supabaseUrl = isSupabaseConfigured ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabasePublishableKey = isSupabaseConfigured ? rawKey.trim() : 'placeholder-anon-key';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

