// src/components/settings/MatchThresholdSlider.tsx
// Fase 2b (issue edu84gp/Aplika-Jobs#125, PLAN paso 13): slider del umbral de
// compatibilidad 0–100 (defecto 50). Bajo 50 se muestra un aviso cercano que
// explica que esas ofertas suelen encajar poco, sin tecnicismos.
import { Gauge, HeartHandshake } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function MatchThresholdSlider({
  value,
  onChange,
  disabled = false,
}: Props) {
  const showLowMatchNotice = value < 50;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Gauge className="w-3.5 h-3.5 text-blue-400" />
          Compatibilidad mínima
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        aria-label="Compatibilidad mínima"
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Más ofertas</span>
        <span>Solo las mejores</span>
      </div>
      {showLowMatchNotice && (
        <p className="mt-2 flex items-start gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] leading-relaxed text-amber-200">
          <HeartHandshake className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-300" />
          Por debajo del 50 % verás más ofertas, pero muchas encajarán poco
          con tu perfil. Si buscas ir a lo seguro, súbelo al 50 % o más.
        </p>
      )}
    </div>
  );
}
