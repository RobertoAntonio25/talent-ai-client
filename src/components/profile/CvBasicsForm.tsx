// src/components/profile/CvBasicsForm.tsx
// Datos básicos del CV manual (nombre, rol objetivo y resumen).
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

export default function CvBasicsForm({
  fullName,
  targetRole,
  summary,
  onSave,
}: {
  fullName: string;
  targetRole: string;
  summary: string;
  onSave: (patch: { fullName: string; targetRole: string; summary: string }) => void;
}) {
  const [name, setName] = useState(fullName);
  const [role, setRole] = useState(targetRole);
  const [sum, setSum] = useState(summary);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Datos básicos
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-400">Nombre completo</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">Rol objetivo</span>
          <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
        </label>
      </div>
      <label className="block mt-3">
        <span className="text-xs text-slate-400">Resumen</span>
        <textarea value={sum} onChange={(e) => setSum(e.target.value)} rows={3} className={inputCls} />
      </label>
      <button
        type="button"
        onClick={() => {
          onSave({ fullName: name, targetRole: role, summary: sum });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 3000);
        }}
        className="mt-3 px-5 py-2 rounded-xl text-xs font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Guardar datos básicos
      </button>
      {saved && (
        <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Guardado (se sincroniza con tu cuenta).
        </p>
      )}
    </div>
  );
}
