// src/components/settings/CareerTransitionToggle.tsx
// Fase 2e: selector de transición profesional. La explicación vive en el
// icono de info (solo hover, como el resto de campos).
import { Route } from "lucide-react";
import Toggle from "../ui/Toggle";
import FieldHelp from "./FieldHelp";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function CareerTransitionToggle({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div
      role="group"
      aria-label="Estoy cambiando de sector o de rol"
      className={`flex h-full flex-col justify-center ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Route className="w-3.5 h-3.5 text-aplika-lima-400 flex-shrink-0" />
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Estoy cambiando de sector o de rol
          <FieldHelp text="Actívalo si vienes de otro sector o quieres cambiar de rol. La búsqueda no filtrará por años de experiencia, priorizará ofertas recientes (de la última semana en adelante) y evitará términos como «senior» en la query, para mostrarte puestos de entrada o reconversión." />
        </span>
        <span className="ml-auto">
          <Toggle enabled={value} onChange={onChange} />
        </span>
      </div>
      {value && (
        <p className="mt-2 text-[11px] text-aplika-lima-300/90">
          Búsqueda en modo transición: sin filtro de experiencia · ofertas
          desde la última semana · sin «senior» en la query.
        </p>
      )}
    </div>
  );
}
