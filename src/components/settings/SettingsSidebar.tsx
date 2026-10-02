// src/components/settings/SettingsSidebar.tsx
// Menú lateral de /settings: navegación entre secciones.
import { Bot, Search, SlidersHorizontal } from "lucide-react";

export type SettingsSection = "busqueda" | "preferencias" | "agente";

const ITEMS: { id: SettingsSection; label: string; icon: typeof Search }[] = [
  { id: "preferencias", label: "Preferencias", icon: SlidersHorizontal },
  { id: "busqueda", label: "Buscar ofertas", icon: Search },
  { id: "agente", label: "Agente IA", icon: Bot },
];

export default function SettingsSidebar({
  active,
  onSelect,
}: {
  active: SettingsSection;
  onSelect: (s: SettingsSection) => void;
}) {
  return (
    <nav
      aria-label="Secciones de configuración"
      className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-aplika-lima-500/15 text-aplika-lima-400 border border-aplika-lima-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
