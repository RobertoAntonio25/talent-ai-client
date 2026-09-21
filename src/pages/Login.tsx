import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState<"google" | "linkedin" | null>(
    null,
  );

  const handleOAuthLogin = (provider: "google" | "linkedin") => {
    setIsLoading(provider);
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans">
      {/* Sección Izquierda */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 justify-center items-center flex-col p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

        <h1 className="text-5xl font-extrabold mb-6 tracking-tight z-10">
          Talent-AI
        </h1>
        <p className="text-xl text-slate-300 text-center max-w-md z-10 leading-relaxed">
          Tu currículum optimizado, las mejores ofertas de empleo y gestión
          inteligente en un solo lugar.
        </p>
      </div>

      {/* Sección Derecha */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-500">
              Inicia sesión para acceder a tu tablero Kanban
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            {/* Botón Google */}
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading !== null}
              className="flex items-center justify-center w-full px-4 py-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed font-medium text-gray-700 shadow-sm"
            >
              {isLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-gray-500" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continuar con Google
            </button>

            {/* Botón LinkedIn */}
            <button
              onClick={() => handleOAuthLogin("linkedin")}
              disabled={isLoading !== null}
              className="flex items-center justify-center w-full px-4 py-3.5 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              {isLoading === "linkedin" ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-white" />
              ) : (
                <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.01-3.28 1.64 1.64 0 0 0 .01 3.28M7.86 18.5V10.13H5.07V18.5h2.79z" />
                </svg>
              )}
              Continuar con LinkedIn
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-500">
              ¿Problemas para entrar?{" "}
              <a
                href="#"
                className="text-blue-600 font-semibold hover:underline"
              >
                Contacta a soporte
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
