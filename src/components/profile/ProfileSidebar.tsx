// src/components/profile/ProfileSidebar.tsx
// Menú lateral de /profile (Fase 2c): navegación entre secciones.
import { FileText, KeyRound, User as UserIcon } from "lucide-react";

export type ProfileSection = "datos" | "password" | "cv";

const ITEMS: { id: ProfileSection; label: string; icon: typeof UserIcon }[] = [
  { id: "datos", label: "Datos personales", icon: UserIcon },
  { id: "password", label: "Contraseña", icon: KeyRound },
  { id: "cv", label: "Mi CV", icon: FileText },
];

export default function ProfileSidebar({
  active,
  onSelect,
}: {
  active: ProfileSection;
  onSelect: (s: ProfileSection) => void;
}) {
  return (
    <nav
      aria-label="Secciones del perfil"
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
