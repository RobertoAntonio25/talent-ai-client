import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VIT_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VIT_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Faltan VIT_SUPABASE_URL / VIT_SUPABASE_ANON_KEY en el .env. El OAuth no funcionará hasta configurarlos.",
  );
}

// Singleton: una sola instancia para toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
