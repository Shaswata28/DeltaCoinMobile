import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoTrueClient } from '@supabase/gotrue-js';
import { PostgrestClient } from '@supabase/postgrest-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Auth client setup
export const auth = new GoTrueClient({
  url: `${supabaseUrl}/auth/v1`,
  autoRefreshToken: true,
  persistSession: true,
  storageKey: 'supabase.auth.token',
  storage: AsyncStorage,
  fetch,
});

// DB client setup
export const db = new PostgrestClient(`${supabaseUrl}/rest/v1`, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'X-Client-Info': 'deltacoin-mobile',
  },
  fetch,
});

// Helper function for data fetching
export async function fetchData<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error;
  if (!data) throw new Error('No data returned');
  return data;
}