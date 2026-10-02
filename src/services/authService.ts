// src/services/authService.ts
import { apiClient } from "./apiClient";
import { supabase } from "../lib/supabase";
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
export async function changePassword(currentPassword: string, newPassword: string) {
  return apiClient<{ success: boolean; message: string }>(
    "/api/auth/change-password",
    { method: "POST", data: { currentPassword, newPassword } },
  );
}

// Paso 1 OAuth: redirige a Google/LinkedIn vía Supabase
export async function loginWithOAuth(provider: OAuthProvider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: mapToSupabaseProvider(provider),
    options: {
      // Al volver, Supabase te deja en /auth/callback
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);
}

// Paso 2 OAuth: canjea session Supabase por JWT interno (API.md sec 1)
export async function exchangeOAuthToken(supabaseToken: string) {
  return apiClient<AuthResponse>("/api/auth/oauth/exchange", {
    method: "POST",
    data: { supabaseToken },
  });
}
