// Configuración del Agente IA: solo opciones del agente automático
// (búsqueda en segundo plano + frecuencia). La búsqueda manual y las
// preferencias viven en /buscar; el CV base, en /profile.
import { useState } from "react";
import { Bot, CalendarClock } from "lucide-react";
import Toggle from "../components/ui/Toggle";

export default function Settings() {
  const [autoSearch, setAutoSearch] = useState(false);
  const [frequency, setFrequency] = useState("diario");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 w-full font-sans animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración del Agente IA
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Automático
          </span>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Ajusta cómo y con qué frecuencia nuestro agente inteligente rastrea
          ofertas compatibles con tu perfil en segundo plano.
        </p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-sm divide-y divide-slate-800/80">
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-aplika-lima-500/10 border border-aplika-lima-500/20 text-aplika-lima-400 rounded-2xl flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Búsqueda Automática
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-aplika-lima-500/10 text-aplika-lima-400 border border-aplika-lima-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                La IA analiza ofertas compatibles y gestiona postulaciones en
                segundo plano.
              </p>
            </div>
          </div>
          <Toggle enabled={autoSearch} onChange={setAutoSearch} />
        </div>

        {autoSearch && (
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-aplika-lima-500/10 border border-aplika-lima-500/20 text-aplika-lima-400 rounded-2xl flex-shrink-0">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Frecuencia de rastreo
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  ¿Con qué intervalo debe el bot escanear nuevas oportunidades?
                </p>
              </div>
            </div>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-aplika-lima-500 focus:border-aplika-lima-500 block p-2.5 outline-none cursor-pointer"
            >
              <option value="diario">Todos los días (Recomendado)</option>
              <option value="semanal">Una vez a la semana</option>
              <option value="mensual">Una vez al mes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
