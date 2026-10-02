import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  FileCheck2,
  Bot,
  Zap,
  ShieldCheck,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* 🌟 NAVEGACIÓN DE LA LANDING */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Talent-AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Características
            </a>
            <a href="#kanban" className="hover:text-white transition-colors">
              Tablero Kanban
            </a>
            <a href="#ats" className="hover:text-white transition-colors">
              CV con IA
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              Iniciar sesión
            </Link>

            <button
              onClick={handleGoToDashboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Abrir App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Luces de fondo decorativas */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>

        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>El CRM de Empleo con Inteligencia Artificial & ATS 2026</span>
        </div>

        {/* Titular Principal */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Organiza tus postulaciones y{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
            multiplica tus entrevistas
          </span>
          .
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
          Tablero Kanban con respuesta instantánea, generador de currículums
          técnicos optimizados para filtros ATS y agente de búsqueda en segundo
          plano.
        </p>

        {/* Botones CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <LayoutDashboard className="w-5 h-5 text-blue-200" />
            <span>Explorar Dashboard Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Crear Cuenta Gratis</span>
          </Link>
        </div>

        {/* Preview Visual Hero (Mockup Interactivo) */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-2xl shadow-black/80 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs font-mono text-slate-500 ml-2">
                talent-ai.app/dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Sincronizado en tiempo real
            </div>
          </div>

          {/* Mini preview Kanban */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {/* Columna 1 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Aplicado (2)
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Spotify</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    95% Match
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  React Engineer
                </p>
                <div className="flex gap-1">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    React
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    TypeScript
                  </span>
                </div>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Entrevista (1)
                </span>
              </div>
              <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3 shadow-lg shadow-purple-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Vercel</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    98% Match
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Staff Frontend Dev
                </p>
                <div className="flex gap-1">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Next.js
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Turbopack
                  </span>
                </div>
              </div>
            </div>

            {/* Columna 3 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Oferta Recibida (1)
                </span>
              </div>
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 shadow-lg shadow-emerald-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Stripe</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    €85k + Equity
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">UI/UX Lead</p>
                <div className="flex gap-1">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Design Systems
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ MÉTRICAS DE IMPACTO */}
      <section className="py-12 border-y border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-white">
              0 ms
            </span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Latencia percibida (Optimistic UI)
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-blue-400">
              98%
            </span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Compatibilidad ATS garantizada
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              3x
            </span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Más entrevistas conseguidas
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-purple-400">
              100%
            </span>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Control sobre tus datos
            </p>
          </div>
        </div>
      </section>

      {/* 🛠️ CARACTERÍSTICAS (BENTO GRID) */}
      <section
        id="features"
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Todo lo que necesitas para tu búsqueda de empleo
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Herramientas diseñadas para desarrolladores y profesionales que
            buscan destacar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Kanban */}
          <div
            id="kanban"
            className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tablero Kanban Interactivo
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Mueve tus postulaciones entre estados con drag-and-drop
                ultrasuave. Edita notas, salarios, modalidades y elimina
                vacantes con confirmación.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center text-xs font-semibold text-blue-400">
              <span>Soporte táctil y ratón</span>
              <Zap className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 2: CV ATS */}
          <div
            id="ats"
            className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all flex flex-col justify-between md:scale-105 md:border-blue-500/40 shadow-xl shadow-blue-500/5"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                CV Optimizado con IA
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Genera versiones de currículum adaptadas con palabras clave
                específicas para cada rol y descarga en PDF A4 listo para enviar
                sin marcas de agua.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center text-xs font-semibold text-indigo-400">
              <span>Descarga directa en A4</span>
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 3: Bot Automático */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Rastreo Inteligente
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Configura la frecuencia del agente para rastrear nuevas
                oportunidades compatibles con tu stack tecnológico
                automáticamente.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center text-xs font-semibold text-purple-400">
              <span>Búsqueda en segundo plano</span>
              <ShieldCheck className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 CTA FINAL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Acelera tu contratación hoy
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl mx-auto font-light">
              Empieza a usar Talent-AI de forma gratuita y lleva el control
              absoluto de tus postulaciones.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Ir al Dashboard
              </button>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📄 FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Talent-AI</span>
            <span>• Plataforma de Gestión de Empleo con IA</span>
          </div>
          <span>© 2026 Talent-AI. Desarrollado con React & Tailwind CSS.</span>
        </div>
      </footer>
    </div>
  );
}
