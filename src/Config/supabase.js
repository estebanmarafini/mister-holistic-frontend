import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY no están configuradas en .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
