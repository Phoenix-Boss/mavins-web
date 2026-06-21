// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
    'Make sure you have a .env.local file in the project root with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
    'Make sure you have a .env.local file in the project root with the correct key.'
  );
}

// Export a singleton instance (NOT a function)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// For backward compatibility
export const createClient = () => supabase;