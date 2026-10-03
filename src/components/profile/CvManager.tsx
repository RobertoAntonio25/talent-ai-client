// src/components/profile/CvManager.tsx
// Gestiona el CV base: subida PDF (la IA extrae tus datos) o edición
// manual por bloques (datos, habilidades, estudios, experiencia,
// proyectos e idiomas). Todo persiste en este dispositivo.
import { useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2, Upload } from "lucide-react";
import { useCv } from "../../hooks/useCv";
import CvBasicsForm from "./CvBasicsForm";
import SkillsEditor from "./SkillsEditor";
import EducationEditor from "./EducationEditor";
import ExperienceEditor from "./ExperienceEditor";
import ProjectsEditor from "./ProjectsEditor";
import LanguagesEditor from "./LanguagesEditor";

export default function CvManager() {
  const {
    cv,
    isUploading,
    uploadError,
    upload,
    clear,
    updateCv,
    isHydrating,
    syncError,
  } = useCv();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    try {
      const up = await upload(file);
      setMsg(`✓ CV actualizado (${up.skills.length} habilidades).`);
    } catch {
      // Motivo en uploadError.
    }
  };

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clear();
    setConfirming(false);
    setMsg("CV eliminado de este dispositivo.");
  };

  return (
    <section aria-label="Mi CV" className="grid gap-6">
      <div>
        <h2 className="font-bold text-white text-sm sm:text-base">Mi CV</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Súbelo en PDF (la IA extrae tus datos) o edítalo por bloques. PDF máx 10MB.
        </p>
      </div>

      <div>
        <p className={`text-xs mb-3 ${cv ? "text-emerald-400" : "text-slate-500"}`}>
          {isHydrating && !cv
            ? "Recuperando tu CV guardado…"
            : cv
              ? `✓ ${cv.fullName || "CV"} — ${cv.skills.length} skills`
              : "Sin CV cargado"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Analizando…" : cv ? "Reemplazar PDF" : "Subir PDF"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!cv || isUploading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {confirming ? "¿Confirmar?" : "Eliminar"}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => void handleFile(e)} />
        {uploadError && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{uploadError}</p>
        )}
        {syncError && (
          <p className="mt-2 text-xs text-amber-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{syncError}</p>
        )}
        {msg && !uploadError && (
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{msg}</p>
        )}
      </div>

      <CvBasicsForm
        key={`basics-${cv?.fullName ?? ""}-${cv?.targetRole ?? ""}`}
        fullName={cv?.fullName ?? ""}
        targetRole={cv?.targetRole ?? ""}
        summary={cv?.summary ?? ""}
        onSave={(patch) => updateCv(patch)}
      />
      <SkillsEditor skills={cv?.skills ?? []} onChange={(skills) => updateCv({ skills })} />
      <EducationEditor items={cv?.education ?? []} onChange={(education) => updateCv({ education })} />
      <ExperienceEditor items={cv?.experience ?? []} onChange={(experience) => updateCv({ experience })} />
      <ProjectsEditor items={cv?.projects ?? []} onChange={(projects) => updateCv({ projects })} />
      <LanguagesEditor items={cv?.languages ?? []} onChange={(languages) => updateCv({ languages })} />
    </section>
  );
}
