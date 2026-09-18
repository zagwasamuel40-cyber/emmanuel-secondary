import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Validates whether a string is a syntactically valid HTTP/HTTPS URL
 */
export function isValidHttpUrl(stringCandidate?: string | null): boolean {
  if (!stringCandidate || typeof stringCandidate !== 'string') return false;
  const trimmed = stringCandidate.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Retrieves the currently active Supabase configuration (prefers localStorage override if present)
 */
export function getActiveSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('ess_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('ess_supabase_key') : null;

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const activeUrl = (localUrl && localUrl.trim()) || envUrl.trim();
  const activeKey = (localKey && localKey.trim()) || envKey.trim();

  const isConfigured = isValidHttpUrl(activeUrl) && activeKey.length > 10;

  return {
    url: activeUrl,
    anonKey: activeKey,
    isConfigured,
  };
}

let cachedClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

/**
 * Gets or initializes the Supabase client safely without crashing on invalid or missing environment variables
 */
export function getSupabaseClient(): SupabaseClient {
  const { url, anonKey, isConfigured } = getActiveSupabaseConfig();

  // If already instantiated with the same credentials, reuse cached instance
  if (cachedClient && lastClientUrl === url && lastClientKey === anonKey) {
    return cachedClient;
  }

  // If valid credentials provided, create real client
  if (isConfigured) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      lastClientUrl = url;
      lastClientKey = anonKey;
      return cachedClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client with provided URL. Falling back to safe mock client.', err);
    }
  }

  // Safe fallback dummy client that will never crash the browser runtime
  cachedClient = createClient('https://offline-mock-school-db.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key', {
    auth: { persistSession: false },
  });
  lastClientUrl = url;
  lastClientKey = anonKey;
  return cachedClient;
}

// Export default safe instance
export const supabase = getSupabaseClient();

/**
 * Tests connection to the configured Supabase database
 */
export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const urlToTest = overrideUrl ?? getActiveSupabaseConfig().url;
  const keyToTest = overrideKey ?? getActiveSupabaseConfig().anonKey;

  if (!isValidHttpUrl(urlToTest)) {
    return {
      success: false,
      message: 'Invalid Supabase URL. Must begin with https:// (e.g., https://your-project.supabase.co)',
    };
  }

  if (!keyToTest || keyToTest.length < 10) {
    return {
      success: false,
      message: 'Supabase Anon/Public API Key is missing or too short.',
    };
  }

  const startTime = Date.now();
  try {
    const testClient = createClient(urlToTest, keyToTest);
    // Ping public table or auth endpoint
    const { error } = await testClient.from('students').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, it's still reachable
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase successfully! (Tables need migration; run supabase_schema.sql)',
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Connection test error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: 'Connected to Supabase successfully and verified tables!',
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error attempting to reach Supabase.',
    };
  }
}

