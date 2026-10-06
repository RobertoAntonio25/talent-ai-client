// src/components/settings/MatchThresholdSlider.tsx
// Fase 2e: slider del umbral de compatibilidad 0–100 con color progresivo
// continuo (rojo → naranja → amarillo → lima) interpolado en HSL y aplicado
// vía `style` (el purgado de Tailwind no afecta a inline styles).
// Transiciones de 150ms para que el cambio sea suave al arrastrar.
import { Gauge, HeartHandshake } from "lucide-react";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

// Paradas de la rampa: en 70 se alcanza el lima de la marca
// (aplika-lima-500 #b7e346 ≈ h78) alineado con el defecto.
const STOP_VALUES = [0, 30, 50, 70, 100];
const STOP_HUES = [4, 24, 45, 78, 84];

function interpolateHue(raw: number): number {
  const v = Math.min(100, Math.max(0, raw));
  for (let i = 1; i < STOP_VALUES.length; i++) {
    const upper = STOP_VALUES[i] ?? 100;
    if (v <= upper) {
      const lower = STOP_VALUES[i - 1] ?? 0;
      const hueLow = STOP_HUES[i - 1] ?? 4;
      const hueHigh = STOP_HUES[i] ?? 84;
      const span = upper - lower || 1;
      return hueLow + ((v - lower) / span) * (hueHigh - hueLow);
    }
  }
  return 84;
}

export default function MatchThresholdSlider({
  value,
  onChange,
  disabled = false,
}: Props) {
  const hue = Math.round(interpolateHue(value) * 10) / 10;
  const accent = `hsl(${hue} 85% 62%)`;
  const softBg = `hsl(${hue} 85% 62% / 0.12)`;
  const softBorder = `hsl(${hue} 85% 62% / 0.35)`;
  const showLowMatchNotice = value < 50;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Gauge
            className="w-3.5 h-3.5 transition-[color] duration-150 ease-out"
            style={{ color: accent }}
          />
          Compatibilidad mínima
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-black border transition-[color,background-color,border-color] duration-150 ease-out"
          style={{
            color: accent,
            backgroundColor: softBg,
            borderColor: softBorder,
          }}
        >
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
        style={{ accentColor: accent }}
        className="mt-2 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-[accent-color] duration-150 ease-out"
      />
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Más ofertas</span>
        <span>Solo las mejores</span>
      </div>
      {showLowMatchNotice && (
        <p className="mt-2 flex items-start gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] leading-relaxed text-amber-200">
          <HeartHandshake className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-300" />
          Por debajo del 50 % verás más ofertas, pero muchas encajarán poco con
          tu perfil. Si buscas ir a lo seguro, súbelo al 50 % o más.
        </p>
      )}
    </div>
  );
}
