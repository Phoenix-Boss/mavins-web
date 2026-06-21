// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase Client] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
    });
  }

  // Throw clear errors if variables are missing
  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
      'Make sure you have a .env.local file in the project root with:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://atojskxrxfsbpeefigtm.supabase.co'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
      'Make sure you have a .env.local file in the project root with the correct key.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    throw new Error(`Invalid supabaseUrl: "${supabaseUrl}" is not a valid URL.`);
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new Error(`Invalid supabaseUrl: "${supabaseUrl}" must use HTTPS protocol.`);
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
};

// Server-side client with service role key (for API routes only)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!supabaseServiceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    throw new Error(`Invalid supabaseUrl: "${supabaseUrl}" is not a valid URL`);
  }

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
};

// Admin client for write operations (use with caution)
export const createAdminClient = () => {
  return createServerClient();
};