// src/components/settings/AgentConfigSection.tsx
// Opciones del agente automático: búsqueda en segundo plano + frecuencia.
import { useState } from "react";
import { Bot, CalendarClock } from "lucide-react";
import Toggle from "../ui/Toggle";

export default function AgentConfigSection() {
  const [autoSearch, setAutoSearch] = useState(false);
  const [frequency, setFrequency] = useState("diario");

  return (
    <section aria-label="Agente IA" className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 border border-slate-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
    </section>
  );
}
