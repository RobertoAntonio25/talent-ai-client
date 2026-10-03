// src/pages/Profile.tsx
// Fase 2e (issue #151): página /profile cableada al back.
// Carga agregado GET /api/profile al montar (usuario + prefs + resumen CV).
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProfileSidebar, {
  type ProfileSection,
} from "../components/profile/ProfileSidebar";
import PersonalDataForm from "../components/profile/PersonalDataForm";
import PasswordForm from "../components/profile/PasswordForm";
import CvManager from "../components/profile/CvManager";
import { useAuth } from "../context/AuthContext";
import { getProfileAggregate, type ProfileAggregate } from "../services/userProfile.service";

const VALID: ProfileSection[] = ["datos", "password", "cv"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const raw = params.get("seccion");
  const active: ProfileSection = VALID.includes(raw as ProfileSection)
    ? (raw as ProfileSection)
    : "datos";

  const select = (s: ProfileSection) => setParams({ seccion: s });

  const [aggregate, setAggregate] = useState<ProfileAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recarga por cuenta: al cambiar de usuario se descarta el agregado anterior
  // para no mostrar datos de la sesión previa.
  const userId = user?.id ?? null;
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      setAggregate(null);
      setIsLoading(true);
      getProfileAggregate()
        .then((data) => {
          if (!mounted) return;
          setAggregate(data);
          // Sincronizar AuthContext + localStorage con datos del back
          updateUser({
            firstName: data.user.firstName ?? "",
            lastName: data.user.lastName ?? "",
            email: data.user.email ?? "",
            location: data.user.location ?? "",
            phone: data.user.phone ?? "",
          });
        })
        .catch(() => {
          // Si falla, mantener lo que haya en localStorage/AuthContext
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    });
    return () => { mounted = false; };
  }, [userId, updateUser]);

  const fullName =
    [aggregate?.user.firstName, aggregate?.user.lastName]
      .filter(Boolean)
      .join(" ") || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Tu perfil";

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto w-full font-sans animate-in fade-in duration-300">
        <div className="p-6 flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando tu perfil…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full font-sans animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {fullName}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Gestiona tus datos, tu contraseña y tu CV base.
        </p>
      </div>
      <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-start">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 backdrop-blur-sm">
          <ProfileSidebar active={active} onSelect={select} />
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 p-5 sm:p-6 backdrop-blur-sm">
          {active === "datos" && <PersonalDataForm />}
          {active === "password" && <PasswordForm />}
          {active === "cv" && <CvManager />}
        </div>
      </div>
    </div>
  );
}
