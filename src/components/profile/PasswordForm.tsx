// src/components/profile/PasswordForm.tsx
// Valida en front; el cambio real aún no está disponible en el backend.
// No se persiste nada en local.
import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import { PASSWORD_PENDING_MSG } from "../../services/userProfile.service";

export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!current || !next || !confirm) {
      setError("Rellena los tres campos.");
      return;
    }
    if (next.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (next !== confirm) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    // Sin endpoint de back: no se cambia nada, se informa del pendiente.
    setError(null);
  };

  const inputCls =
    "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

  return (
    <section aria-label="Cambiar contraseña">
      <h2 className="font-bold text-white text-sm sm:text-base">Contraseña</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        Por seguridad, el cambio se activará próximamente.
      </p>
      <div className="grid gap-3 max-w-md">
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Actual</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Nueva (mín. 6)</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Confirmar nueva</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} />
        </label>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Revisar cambio
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      <p className="mt-3 p-3 rounded-xl bg-aplika-lima-500/10 border border-aplika-lima-500/20 text-[11px] sm:text-xs text-aplika-lima-300 flex gap-2">
        <Info className="w-4 h-4 flex-shrink-0" /> {PASSWORD_PENDING_MSG}
      </p>
    </section>
  );
}
