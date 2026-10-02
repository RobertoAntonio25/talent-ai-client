// src/components/settings/FieldHelp.tsx
// Icono de info para las preferencias: la explicación aparece SOLO en
// hover (CSS puro con `group-hover`, sin estado ni clicks que se queden
// abiertos). La tarjeta es posicionada y usa solo spans (válida en
// `label`/`legend`).
import { Info } from "lucide-react";

interface Props {
  /** Explicación que se muestra en hover. */
  text: string;
}

export default function FieldHelp({ text }: Props) {
  return (
    <span className="group relative inline-flex flex-shrink-0 cursor-help">
      <Info className="w-3.5 h-3.5 text-slate-500 transition-colors group-hover:text-aplika-lima-400" />
      <span className="invisible pointer-events-none absolute left-0 top-full z-10 mt-1.5 w-52 max-w-[60vw] whitespace-normal rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-[11px] font-normal leading-relaxed text-slate-300 opacity-0 shadow-xl shadow-black/50 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
