// src/components/profile/PasswordForm.tsx
// Cambia la contraseña vía POST /api/auth/change-password.
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { changePassword } from "../../services/authService";

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSaved(false);
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
    setIsSaving(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section aria-label="Cambiar contraseña">
      <h2 className="font-bold text-white text-sm sm:text-base">Contraseña</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        Actualiza tu contraseña de acceso.
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
        onClick={() => void handleSubmit()}
        disabled={isSaving}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? "Guardando…" : "Cambiar contraseña"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {saved && (
        <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Contraseña actualizada.
        </p>
      )}
    </section>
  );
}
