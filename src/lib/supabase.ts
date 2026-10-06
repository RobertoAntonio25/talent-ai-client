import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VIT_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VIT_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// #141: fail-fast sin fallback a dominio fantasma. Sin vars, OAuth queda
// deshabilitado y loginWithOAuth falla en voz alta antes de redirigir.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] Faltan VIT_SUPABASE_URL / VIT_SUPABASE_ANON_KEY. OAuth deshabilitado.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://supabase-not-configured.invalid",
  supabaseAnonKey ?? "supabase-not-configured",
);
