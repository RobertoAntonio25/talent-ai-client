// src/components/profile/PersonalDataForm.tsx
// Fase 2e (issue #151): edita datos personales contra el back
// (GET /api/users/me al montar, PATCH /api/users/me al guardar).
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMe, updateMe } from "../../services/userProfile.service";

export default function PersonalDataForm() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del back al montar y al cambiar de cuenta (carga diferida
  // para evitar setState síncrono en efecto). Sin esto se ven los datos del
  // usuario anterior.
  const userId = user?.id ?? null;
  const uFirstName = user?.firstName ?? "";
  const uLastName = user?.lastName ?? "";
  const uEmail = user?.email ?? "";
  const uLocation = user?.location ?? "";
  const uPhone = user?.phone ?? "";
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      setFirstName(uFirstName);
      setLastName(uLastName);
      setEmail(uEmail);
      setLocation(uLocation);
      setPhone(uPhone);
      setError(null);
      setSaved(false);
      setIsLoading(true);
      getMe()
        .then((data) => {
          if (!mounted) return;
          setFirstName(data.firstName ?? "");
          setLastName(data.lastName ?? "");
          setEmail(data.email ?? "");
          setLocation(data.location ?? "");
          setPhone(data.phone ?? "");
          // Sincronizar AuthContext + localStorage con datos del back
          updateUser({
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            email: data.email ?? "",
            location: data.location ?? "",
            phone: data.phone ?? "",
          });
        })
        .catch(() => {
          if (!mounted) return;
          // Si falla, mantener lo que haya en localStorage/AuthContext
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    });
    return () => { mounted = false; };
  }, [userId, uFirstName, uLastName, uEmail, uLocation, uPhone, updateUser]);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    setIsSaving(true);
    try {
      const patch = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        location: location.trim(),
        phone: phone.trim() || null,
      };
      const savedUser = await updateMe(patch);
      // Sincronizar AuthContext + localStorage con la respuesta del back
      updateUser({
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        location: savedUser.location,
        phone: savedUser.phone ?? "",
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

  if (isLoading) {
    return (
      <section aria-label="Datos personales" className="p-6 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando tus datos…
      </section>
    );
  }

  return (
    <section aria-label="Datos personales">
      <h2 className="font-bold text-white text-sm sm:text-base">Datos personales</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Nombre</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ada" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Apellidos</span>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Lovelace" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-slate-400 font-medium">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@mail.com" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Ubicación</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Madrid, España" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400 font-medium">Teléfono</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" className={inputCls} />
        </label>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? "Guardando…" : "Guardar datos"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Datos guardados correctamente.
        </p>
      )}
    </section>
  );
}
