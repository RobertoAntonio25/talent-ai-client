// src/components/profile/PasswordForm.tsx
// Fase 2e (issue #151): cambio de contraseña vía POST /api/auth/change-password
// con manejo específico de errores: 401 (actual incorrecta) y 429 (rate limit).
// Issue #189: cuentas solo-OAuth (hasPassword === false) crean su contraseña
// vía POST /api/auth/set-password (sin pedir la actual).
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { changePassword, setPassword } from "../../services/authService";
import { ApiError } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

export default function PasswordForm() {
  const { user, updateUser } = useAuth();
  // undefined (sesión guardada pre-#189) → modo cambio clásico.
  const isCreateMode = user?.hasPassword === false;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedIsCreate, setSavedIsCreate] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSaved(false);
    setSavedIsCreate(false);
    if ((!isCreateMode && !current) || !next || !confirm) {
      setError(
        isCreateMode ? "Rellena los dos campos." : "Rellena los tres campos.",
      );
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
      if (isCreateMode) {
        await setPassword(next);
        // A partir de aquí la cuenta ya tiene contraseña.
        updateUser({ hasPassword: true });
      } else {
        await changePassword(current, next);
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setSavedIsCreate(isCreateMode);
      setSaved(true);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401 && e.code === "INVALID_CREDENTIALS") {
          setError("La contraseña actual es incorrecta.");
        } else if (e.status === 401 && e.code === "OAUTH_ONLY_ACCOUNT") {
          setError("Esta cuenta usa OAuth (Google/LinkedIn) y no tiene contraseña.");
        } else if (e.status === 409 && e.code === "PASSWORD_ALREADY_SET") {
          setError("Esta cuenta ya tiene contraseña. Usa el cambio clásico.");
          updateUser({ hasPassword: true });
        } else if (e.status === 400 && e.code === "PASSWORD_REUSE") {
          setError("La nueva contraseña no puede ser igual a la actual.");
        } else if (e.status === 429) {
          setError("Demasiadas peticiones. Inténtalo de nuevo en 15 minutos.");
        } else {
          setError(e.message);
        }
      } else {
        setError(
          e instanceof Error ? e.message : "No se pudo guardar la contraseña.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section aria-label={isCreateMode ? "Crear contraseña" : "Cambiar contraseña"}>
      <h2 className="font-bold text-white text-sm sm:text-base">
        {isCreateMode ? "Crear contraseña" : "Contraseña"}
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        {isCreateMode
          ? "Tu cuenta usa Google/LinkedIn. Crea una contraseña para entrar también con email."
          : "Actualiza tu contraseña de acceso."}
      </p>
      <div className="grid gap-3 max-w-md">
        {!isCreateMode && (
          <label className="block">
            <span className="text-xs text-slate-400 font-medium">Actual</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={inputCls} />
          </label>
        )}
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
        {isSaving
          ? "Guardando…"
          : isCreateMode
            ? "Crear contraseña"
            : "Cambiar contraseña"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {saved && (
        <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />{" "}
          {savedIsCreate
            ? "Contraseña creada. Ya puedes entrar con email."
            : "Contraseña actualizada."}
        </p>
      )}
    </section>
  );
}
