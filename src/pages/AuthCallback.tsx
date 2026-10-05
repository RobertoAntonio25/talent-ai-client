// src/pages/AuthCallback.tsx
// #142: callback robusto (PKCE + reintentos + errores por code).
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { exchangeOAuthToken } from "../services/authService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const SESSION_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const SIGNIN_EVENT_TIMEOUT_MS = 3000;

function friendlyError(code: string | null, fallback: string): string {
  if (code === "RATE_LIMIT_EXCEEDED" || code === "AUTH_RATE_LIMIT_EXCEEDED") {
    return "Demasiadas peticiones. Inténtalo de nuevo en 15 minutos.";
  }
  if (code === "TIMEOUT" || code === "NETWORK_ERROR") {
    return "No se pudo conectar con el servidor. Reinténtalo de nuevo en unos minutos.";
  }
  return fallback;
}

async function waitForSession(): Promise<Session | null> {
  // El cliente Supabase procesa la URL (hash implicit) de forma async al
  // cargar: reintentar antes de rendirse.
  for (let attempt = 0; attempt < SESSION_RETRIES; attempt++) {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error(sessionError.message);
    if (data.session?.access_token) return data.session;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  // Fallback: esperar al evento SIGNED_IN por si llega tarde.
  return new Promise((resolve) => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.access_token) {
        sub.subscription.unsubscribe();
        resolve(s);
      }
    });
    setTimeout(() => {
      sub.subscription.unsubscribe();
      resolve(null);
    }, SIGNIN_EVENT_TIMEOUT_MS);
  });
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag anti-doble-ejecución (StrictMode en dev + re-renders).
    let cancelled = false;

    const run = async () => {
      try {
        // 0. El proveedor devolvió error (p. ej. cancelar en LinkedIn):
        // volver a login/register con el error en inline, sin página
        // de error intermedia.
        const urlError = searchParams.get("error");
        if (urlError) {
          const desc = searchParams.get("error_description");
          const message = /cancel/i.test(`${urlError} ${desc ?? ""}`)
            ? "Cancelaste el inicio de sesión con el proveedor. Puedes intentarlo de nuevo o usar tu email."
            : (desc ?? "El proveedor denegó el acceso.");
          const stored = sessionStorage.getItem("oauth_return_to");
          sessionStorage.removeItem("oauth_return_to");
          const to = stored === "/register" ? "/register" : "/login";
          if (!cancelled) {
            navigate(to, { replace: true, state: { oauthError: message } });
          }
          return;
        }

        // 1. PKCE: ?code= -> canjear por sesión Supabase.
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw new Error(exchangeError.message);
        }

        // 2. Sesión Supabase (reintentos + evento como fallback).
        const session = await waitForSession();
        if (!session?.access_token) {
          throw new Error("No se pudo obtener la sesión de Supabase.");
        }

        // 3. Canjeamos por JWT interno (mismo shape que login clásico).
        const res = await exchangeOAuthToken(session.access_token);

        if (cancelled) return;
        sessionStorage.removeItem("oauth_return_to");
        // Guardamos IGUAL que login clásico: clave "token", no "accessToken".
        login(res.data.accessToken, res.data.user);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          setError(friendlyError(e.code ?? null, e.message));
        } else {
          setError(e instanceof Error ? e.message : "Error en callback OAuth");
        }
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [login, navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-aplika-night-950 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h1 className="text-lg font-bold text-white">
          Error al iniciar sesión
        </h1>
        <p className="text-sm text-slate-400 max-w-sm">{error}</p>
        <Link
          to="/login"
          className="text-sm font-semibold text-aplika-lima-400 hover:underline"
        >
          Volver al login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-aplika-night-950 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-aplika-lima-400" />
      <p className="text-sm font-medium">Completando inicio de sesión...</p>
    </div>
  );
}
