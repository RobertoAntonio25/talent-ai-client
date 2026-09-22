// src/pages/Settings.tsx (o donde tengas tus vistas)
import { useState } from "react";
import { Search, Loader2, Bot, CalendarClock } from "lucide-react";
import Toggle from "../components/ui/Toggle"; // Ajusta la ruta según tu proyecto

export default function Settings() {
  // --- ESTADOS ---
  const [autoSearch, setAutoSearch] = useState(false);
  const [frequency, setFrequency] = useState("diario");
  const [isSearching, setIsSearching] = useState(false);

  // --- LÓGICA DE SIMULACIÓN ---
  const handleSearchNow = () => {
    setIsSearching(true);

    // Simulamos que el backend está buscando ofertas en internet
    setTimeout(() => {
      setIsSearching(false);
      // Aquí en el futuro mostraremos un Toast de éxito
      alert("¡Búsqueda completada! Se encontraron 3 nuevas ofertas.");
    }, 3000); // Tarda 3 segundos
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 w-full font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Configuración de la IA
        </h1>
        <p className="text-slate-500 mt-2">
          Ajusta cómo y cuándo nuestro bot busca empleo para ti.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* SECCIÓN 1: Búsqueda Automática (El Toggle) */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Búsqueda Automática
              </h3>
              <p className="text-sm text-slate-500">
                La IA aplicará a ofertas por ti en segundo plano.
              </p>
            </div>
          </div>
          {/* Aquí usamos nuestro componente reutilizable */}
          <Toggle enabled={autoSearch} onChange={setAutoSearch} />
        </div>

        {/* SECCIÓN 2: Frecuencia (Selector) */}
        {/* Solo mostramos esto si la búsqueda automática está activada */}
        {autoSearch && (
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Frecuencia de rastreo
                </h3>
                <p className="text-sm text-slate-500">
                  ¿Cada cuánto debemos buscar?
                </p>
              </div>
            </div>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
            >
              <option value="diario">Todos los días</option>
              <option value="semanal">Una vez a la semana</option>
              <option value="mensual">Una vez al mes</option>
            </select>
          </div>
        )}

        {/* SECCIÓN 3: El Botón de Showtime */}
        <div className="p-6 bg-slate-50 flex justify-end">
          <button
            onClick={handleSearchNow}
            disabled={isSearching}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all
              ${
                isSearching
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              }
            `}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Rastreando la web...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar Ofertas Ahora
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
