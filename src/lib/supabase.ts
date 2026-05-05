import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn('LightFeed: Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Auth requests (/auth/v1/) get a short timeout — the auth service is always
// responsive (~400ms). A hanging token-refresh blocks the entire HTTP/2
// connection and prevents DB requests from going through, so we abort quickly.
// DB requests (/rest/v1/) get a longer timeout to survive free-tier cold starts.
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input
    : input instanceof URL ? input.href
    : (input as Request).url;
  const ms = url.includes('/auth/v1/') ? 8_000 : 45_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        // Prevents the client from blocking initialization on a token-refresh
        // network call. Without this, every page load while logged in hangs
        // because getSession() waits for the refresh before resolving, which
        // blocks all REST requests on the same connection.
        autoRefreshToken: false,
      },
      global: { fetch: fetchWithTimeout },
    })
  : null;
