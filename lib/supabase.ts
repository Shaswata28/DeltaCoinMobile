import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    storage: AsyncStorage,
  },
  realtime: {
    // Disable realtime subscriptions
    enabled: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'deltacoin-mobile',
    },
  },
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