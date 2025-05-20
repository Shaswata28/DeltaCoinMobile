import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    storage: {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {}
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      },
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});