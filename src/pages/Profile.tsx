// src/pages/Profile.tsx
// Fase 2c (issue edu84gp/Aplika-Jobs#148): página de perfil con menú lateral
// (datos personales, contraseña, CV, otras). Protegida vía ProtectedRoute.
import { useSearchParams } from "react-router-dom";
import ProfileSidebar, {
  type ProfileSection,
} from "../components/profile/ProfileSidebar";
import PersonalDataForm from "../components/profile/PersonalDataForm";
import PasswordForm from "../components/profile/PasswordForm";
import CvManager from "../components/profile/CvManager";
import OtherOptions from "../components/profile/OtherOptions";
import { useAuth } from "../context/AuthContext";

const VALID: ProfileSection[] = ["datos", "password", "cv", "otras"];

export default function Profile() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const raw = params.get("seccion");
  const active: ProfileSection = VALID.includes(raw as ProfileSection)
    ? (raw as ProfileSection)
    : "datos";

  const select = (s: ProfileSection) => setParams({ seccion: s });

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Tu perfil";

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
          {active === "otras" && <OtherOptions />}
        </div>
      </div>
    </div>
  );
}
