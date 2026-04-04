import { AuthClient } from '@supabase/auth-js';
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env para usar a autenticacao com Supabase.'
  );
}

export const supabaseAuth = new AuthClient({
  url: `${SUPABASE_URL}/auth/v1`,
  headers: {
    apikey: SUPABASE_ANON_KEY,
  },
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
});
