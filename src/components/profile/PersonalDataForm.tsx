// src/components/profile/PersonalDataForm.tsx
// Edita datos personales (persisten en este dispositivo vía AuthContext).
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PersonalDataForm() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      location: location.trim(),
      phone: phone.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const inputCls =
    "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

  return (
    <section aria-label="Datos personales">
      <h2 className="font-bold text-white text-sm sm:text-base">Datos personales</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        Se guardan en este dispositivo.
      </p>
      <p className="text-xs text-slate-500 mb-4">El email solo se actualiza en este dispositivo.</p>
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
        className="mt-4 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 cursor-pointer"
      >
        Guardar datos
      </button>
      {saved && (
        <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Datos guardados en este dispositivo.
        </p>
      )}
    </section>
  );
}
