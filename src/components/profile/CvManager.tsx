// src/components/profile/CvManager.tsx
// Gestiona el CV base: subida PDF (la IA extrae tus datos) o edición
// manual por bloques (datos, habilidades, estudios, experiencia,
// proyectos e idiomas). Todo persiste en este dispositivo.
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Languages,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useCv } from "../../hooks/useCv";
import { useAuth } from "../../context/AuthContext";
import { mapProfileCvToGeneratedCV, assessCvCompleteness, CV_MISSING_LABELS } from "../../adapters/cvAdapter";
import { translateBaseCv } from "../../services/userProfile.service";
import type { GeneratedCV } from "../../types/cv";
import CvViewer from "../ui/CvViewer";
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
  const { user } = useAuth();

  // Issue #11: vista traducida bajo demanda (no se guarda; las tablas siguen
  // en el idioma original). Se descarta si el CV cambia por debajo.
  const [translated, setTranslated] = useState<GeneratedCV | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  useEffect(() => {
    void Promise.resolve().then(() => {
      setTranslated(null);
      setTranslateError(null);
    });
  }, [cv]);

  const otherLang = cv?.sourceLanguage === "en" ? "es" : "en";

  const handleTranslate = async () => {
    if (!cv || isTranslating) return;
    setMsg(null);
    setTranslateError(null);
    setIsTranslating(true);
    try {
      const res = await translateBaseCv({
        targetLanguage: otherLang,
        ...(cv.sourceLanguage ? { sourceLanguage: cv.sourceLanguage } : {}),
      });
      const mapped = mapProfileCvToGeneratedCV(res.profile, user);
      setTranslated({ ...mapped, sourceLanguage: res.targetLanguage });
      setMsg(
        res.translated
          ? `✓ Vista en ${otherLang === "en" ? "English" : "Español"} (no guardada).`
          : "Ya está en ese idioma.",
      );
    } catch (e) {
      setTranslated(null);
      setTranslateError(
        e instanceof Error ? e.message : "No se pudo traducir el CV.",
      );
    } finally {
      setIsTranslating(false);
    }
  };

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
          {translated ? (
            <button
              type="button"
              onClick={() => setTranslated(null)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
            >
              Volver al original
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleTranslate()}
              disabled={!cv || isUploading || isTranslating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 cursor-pointer"
              title="Traduce el CV al otro idioma solo para verlo (no se guarda)"
            >
              {isTranslating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
              {isTranslating
                ? "Traduciendo…"
                : `Ver en ${otherLang === "en" ? "English" : "Español"}`}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => void handleFile(e)} />
        {(() => {
          const check = assessCvCompleteness(cv);
          if (!check.needsReview) return null;
          return (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Tu CV necesita revisión (nada se inventó por ti).</p>
                <p className="mt-0.5 text-amber-200/90">
                  Completa: {check.missingFields.map((f) => CV_MISSING_LABELS[f]).join(", ")}.
                  {check.missingFields.includes("targetRole") && " Pon tu rol en Datos abajo: sin rol no hay búsqueda ni CV adaptado."}
                </p>
              </div>
            </div>
          );
        })()}
        {uploadError && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{uploadError}</p>
        )}
        {syncError && (
          <p className="mt-2 text-xs text-amber-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{syncError}</p>
        )}
        {translateError && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{translateError}</p>
        )}
        {msg && !uploadError && (
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{msg}</p>
        )}
      </div>

      {translated && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-3">
          <p className="mb-3 text-xs text-violet-200">
            Vista traducida (no guardada): tus datos en BD siguen en el idioma original.
          </p>
          <CvViewer cv={translated} language={translated.sourceLanguage ?? "es"} />
        </div>
      )}

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
