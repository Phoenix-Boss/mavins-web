// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// DO NOT create the client or throw at module level — this file is evaluated
// on the server during Next.js static generation, where browser-oriented
// singletons and missing-env throws silently drop routes from the build output.
// Everything is deferred to the first createClient() call instead.

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // In a browser context this is a real misconfiguration — surface it clearly.
    // In a server/build context we return a dummy so static generation doesn't crash;
    // any actual DB call will fail fast with a clear network error instead of a build-time throw.
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables.\n' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.'
      );
    }
    // Server-side during build: return a no-op placeholder so the module loads cleanly.
    // Real requests never reach this path in production since the vars are set.
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}

// Convenience singleton for files that import `supabase` directly
// (e.g. services that aren't React hooks). Evaluated lazily on first access.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return (createClient() as any)[prop];
  },
});
