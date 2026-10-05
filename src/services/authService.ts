// src/services/authService.ts
import { apiClient } from "./apiClient";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { User } from "../context/AuthContext";

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
  message: string;
}

export type OAuthProvider = "google" | "linkedin";

function mapToSupabaseProvider(p: OAuthProvider): "google" | "linkedin_oidc" {
  // OJO: en Supabase LinkedIn se llama 'linkedin_oidc', no 'linkedin'
  return p === "linkedin" ? "linkedin_oidc" : "google";
}

// Email clásico
export async function loginWithEmail(email: string, password: string) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    data: { email: email.trim().toLowerCase(), password },
  });
}

export async function registerWithEmail(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: string;
}) {
  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    data: payload,
  });
}

// Cambio de contraseña (requiere el endpoint POST /api/auth/change-password).
// #144: apiClient ya no adjunta Bearer a /api/auth/*, así que esta llamada
// autenticada lo manda explícito.
export async function changePassword(currentPassword: string, newPassword: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Sesión no encontrada. Inicia sesión de nuevo.");
  }
  return apiClient<{ success: boolean; message: string }>(
    "/api/auth/change-password",
    {
      method: "POST",
      data: { currentPassword, newPassword },
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

// Paso 1 OAuth: redirige a Google/LinkedIn vía Supabase.
// #134: guarda la página de origen para que el callback pueda devolver
// los errores del proveedor (p. ej. cancelar) a login/register en inline.
export async function loginWithOAuth(provider: OAuthProvider, returnTo?: string) {
  // #141: fallar en voz alta en vez de redirigir a un dominio fantasma
  if (!isSupabaseConfigured) {
    throw new Error(
      "OAuth no configurado: faltan VIT_SUPABASE_URL / VIT_SUPABASE_ANON_KEY.",
    );
  }
  if (returnTo) {
    // Espejo en localStorage: el sessionStorage puede perderse en las
    // idas y vueltas por el proveedor/Supabase.
    sessionStorage.setItem("oauth_return_to", returnTo);
    localStorage.setItem("oauth_return_to", returnTo);
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: mapToSupabaseProvider(provider),
    options: {
      // Al volver, Supabase te deja en /auth/callback
      redirectTo: `${window.location.origin}/auth/callback`,
      // Google reutiliza su cookie SSO y entra directo; forzar el chooser.
      queryParams:
        provider === "google" ? { prompt: "select_account" } : undefined,
    },
  });
  if (error) throw new Error(error.message);
}

// Paso 2 OAuth: canjea session Supabase por JWT interno (API.md sec 1).
// Timeout amplio: Render tarda 30-50s en despertar en la 1ª petición del día.
export async function exchangeOAuthToken(
  supabaseToken: string,
  timeoutMs = 60000,
) {
  return apiClient<AuthResponse>("/api/auth/oauth/exchange", {
    method: "POST",
    data: { supabaseToken },
    timeoutMs,
  });
}
