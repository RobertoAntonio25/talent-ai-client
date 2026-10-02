// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { exchangeOAuthToken } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // 1. Supabase ya procesó el ?code=... y guardó la sesión
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw new Error(sessionError.message);
        if (!session?.access_token) {
          throw new Error("No se pudo obtener la sesión de Supabase.");
        }

        // 2. Canjeamos por JWT interno (mismo shape que login clásico)
        const res = await exchangeOAuthToken(session.access_token);

        // 3. Guardamos IGUAL que login clásico: clave "token", no "accessToken"
        login(res.data.accessToken, res.data.user);

        // 4. A partir de aquí el front no cambia nada (como dice tu compi)
        navigate("/dashboard", { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error en callback OAuth");
      }
    };
    run();
  }, [login, navigate]);

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
