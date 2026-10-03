// src/components/kanban/JobDetailModal.tsx
// Fase 3 (c2 + c3): detalle de una tarjeta del Kanban en 3 pestañas:
//   1. Detalle de la vacante (datos de la oferta + evaluar match con IA).
//   2. Currículum Vitae ATS adaptado por IA (fallback: CV clásico del usuario).
//   3. Carta de presentación generada por IA, lista para copiar al email.
// c3 conecta los viewers (CvViewer / CoverLetterViewer) con los datos reales
// del hook useOptimizer (Fase 2) a través del puerto OptimizerPort.
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileText,
  LayoutGrid,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import Modal from "../ui/Modal";
import CvViewer from "../ui/CvViewer";
import CoverLetterViewer from "../ui/CoverLetterViewer";
import { useCv } from "../../hooks/useCv";
import { evaluateMatch } from "../../services/aiService";
import type {
  CoverLetterOutput,
  OptimizedCv,
} from "../../models/optimizer.model";
import type { ColumnStatus, JobApplication } from "../../types/kanban";
import type { GeneratedCV } from "../../types/cv";

// Puerto que publica el hook useOptimizer (Fase 2). El modal no se acopla al
// hook concreto: cualquier objeto con esta forma sirve (mock en tests, otra
// implementación futura...). Pasar `useOptimizer()` directamente cumple el tipo.
export interface OptimizerPort {
  optimizedCv: OptimizedCv | null;
  coverLetter: CoverLetterOutput | null;
  isLoadingCv: boolean;
  isLoadingLetter: boolean;
  cvError: string | null;
  letterError: string | null;
  fetchOrGenerateCv: (
    jobOfferId: string,
    opts?: { force?: boolean },
  ) => Promise<OptimizedCv | null>;
  fetchOrGenerateLetter: (
    jobOfferId: string,
    opts?: { force?: boolean },
  ) => Promise<CoverLetterOutput | null>;
}

type DetailTab = "overview" | "cv" | "cover_letter";

interface JobDetailModalProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onMoveStatus?: (jobId: string, newStatus: ColumnStatus) => void;
  onRefresh?: () => void;
  optimizer?: OptimizerPort | null;
}

const STATUS_OPTIONS: { id: ColumnStatus; label: string }[] = [
  { id: "por_revisar", label: "Por Revisar" },
  { id: "aplicado", label: "Aplicado" },
  { id: "entrevista", label: "Entrevista" },
  { id: "oferta", label: "Oferta" },
];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

// Placeholder honesto (mismo criterio que el Dashboard): sin CV subido no se
// inventan datos personales, se pide el PDF.
const EMPTY_CV: GeneratedCV = {
  fullName: "[Sube tu CV en PDF para verlo aquí]",
  targetRole: "Sin CV cargado",
  summary:
    "Sube tu CV en PDF desde Configuración o desde el Dashboard para generar tu perfil optimizado por IA. Después podrás adaptarlo a cada vacante.",
  contact: {
    email: "[tu email]",
    phone: "[tu teléfono]",
    location: "[tu ubicación]",
    linkedin: "[tu linkedin]",
    portfolio: "[tu portfolio]",
  },
  skills: [],
  experience: [],
};

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
  onMoveStatus,
  onRefresh,
  optimizer = null,
}: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalMsg, setEvalMsg] = useState<string | null>(null);
  const { cv } = useCv();

  // Al abrir con otra tarjeta: overview por defecto + limpia el mensaje de
  // evaluate. Patrón oficial "ajustar estado cuando cambian las props" (sin
  // efectos): comparamos con el id del render anterior y reseteamos si cambió.
  const [lastJobId, setLastJobId] = useState<string | null>(job?.id ?? null);
  // El hook expone solo el último documento cargado; recordamos para qué oferta
  // se pidió desde este modal para no mezclar vacantes al cambiar de tarjeta.
  const [cvRequestedFor, setCvRequestedFor] = useState<string | null>(null);
  const [letterRequestedFor, setLetterRequestedFor] = useState<string | null>(
    null,
  );
  const currentJobId = job?.id ?? null;
  if (currentJobId !== lastJobId) {
    setLastJobId(currentJobId);
    setActiveTab("overview");
    setEvalMsg(null);
    setCvRequestedFor(null);
    setLetterRequestedFor(null);
  }

  // Fase 3 (c3): al entrar a la pestaña se pide a la IA el documento de esta
  // oferta. El hook deduplica peticiones en vuelo y cachea por jobOfferId, así
  // que repetir la llamada es barato. Sin jobOfferId se usa el CV clásico.
  const handleSelectTab = (tab: DetailTab) => {
    setActiveTab(tab);
    const jobOfferId = job?.jobOfferId;
    if (!optimizer || !jobOfferId) return;
    if (tab === "cv") {
      setCvRequestedFor(jobOfferId);
      void optimizer.fetchOrGenerateCv(jobOfferId);
    }
    if (tab === "cover_letter") {
      setLetterRequestedFor(jobOfferId);
      void optimizer.fetchOrGenerateLetter(jobOfferId);
    }
  };

  const handleEvaluate = async () => {
    if (!job?.jobOfferId || isEvaluating) return;
    setIsEvaluating(true);
    setEvalMsg(null);
    try {
      const res = await evaluateMatch(job.jobOfferId);
      setEvalMsg(
        res.isMatch
          ? `Match ${res.score}%: ${res.reason ?? "compatible con tu perfil."}`
          : `Sin match (${res.score}%). Faltan: ${
              (res.missingSkills ?? []).slice(0, 5).join(", ") || "—"
            }`,
      );
      onRefresh?.();
    } catch (e) {
      setEvalMsg(e instanceof Error ? e.message : "Error al evaluar.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRegenerateCv = () => {
    const jobOfferId = job?.jobOfferId;
    if (optimizer && jobOfferId) {
      setCvRequestedFor(jobOfferId);
      void optimizer.fetchOrGenerateCv(jobOfferId, { force: true });
    }
  };

  const handleRegenerateLetter = () => {
    const jobOfferId = job?.jobOfferId;
    if (optimizer && jobOfferId) {
      setLetterRequestedFor(jobOfferId);
      void optimizer.fetchOrGenerateLetter(jobOfferId, { force: true });
    }
  };

  // Habilidades que el usuario posee = las de su CV menos las faltantes según la IA.
  const cvSkills = cv?.skills ?? [];
  const missing = job?.missingSkills ?? [];
  const missingSet = new Set(missing.map(norm));
  const ownedSkills = cvSkills.filter((s) => !missingSet.has(norm(s)));

  // CV clásico real (el subido por el usuario) como base y fallback de la pestaña CV.
  const legacyCv: GeneratedCV = cv ?? EMPTY_CV;
  const jobOfferId = job?.jobOfferId ?? null;
  const canOptimize = Boolean(jobOfferId && optimizer);

  // Datos IA solo si pertenecen a la oferta abierta y no hay carga/error en
  // curso: el hook guarda el último documento cargado, sea de la oferta que sea.
  const cvRequestMatches = Boolean(jobOfferId && cvRequestedFor === jobOfferId);
  const letterRequestMatches = Boolean(
    jobOfferId && letterRequestedFor === jobOfferId,
  );
  const optimizedCvData =
    cvRequestMatches && !optimizer?.isLoadingCv && !optimizer?.cvError
      ? optimizer?.optimizedCv ?? null
      : null;
  const cvErrorForThisJob = cvRequestMatches
    ? optimizer?.cvError ?? null
    : null;
  const letterData =
    letterRequestMatches && !optimizer?.isLoadingLetter && !optimizer?.letterError
      ? optimizer?.coverLetter ?? null
      : null;
  const letterErrorForThisJob = letterRequestMatches
    ? optimizer?.letterError ?? null
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? `${job.position} en ${job.company}` : "Postulación"}
      subtitle="Detalle de la vacante y documentos optimizados por IA con formato ATS."
    >
      {job && (
        <div className="flex flex-col gap-5">
          {/* Selector de 3 pestañas */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => handleSelectTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-aplika-lima-500 text-aplika-night-950 shadow-md shadow-aplika-lima-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Detalle de la Vacante</span>
            </button>
            {/* 🟣 Acento IA: CV generado por IA (ver paleta en Landing) */}
            <button
              type="button"
              onClick={() => handleSelectTab("cv")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "cv"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Currículum Vitae ATS</span>
            </button>
            {/* 🟣 Acento IA: carta generada por IA (ver paleta en Landing) */}
            <button
              type="button"
              onClick={() => handleSelectTab("cover_letter")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "cover_letter"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Carta de Presentación</span>
            </button>
          </div>

          {/* TAB 1: DETALLE DE LA VACANTE */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              {/* Encabezado */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {job.position}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Badge de match IA */}
              {typeof job.matchScore === "number" ? (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <Sparkles className="w-4 h-4 text-violet-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-violet-200">
                      {job.matchScore}% Match
                    </p>
                    {(job.matchReason || job.notes) && (
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        {job.matchReason || job.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    Aún sin análisis de IA para esta oferta. Usa el botón de
                    abajo para evaluarla con tu CV.
                  </p>
                </div>
              )}

              {/* Botón evaluar match (mudado desde KanBoard) */}
              {job.jobOfferId && (
                <div>
                  <button
                    type="button"
                    onClick={() => void handleEvaluate()}
                    disabled={isEvaluating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isEvaluating
                      ? "Evaluando con IA…"
                      : "Evaluar match con mi CV"}
                  </button>
                  {evalMsg && (
                    <p className="mt-2 text-xs text-slate-300">{evalMsg}</p>
                  )}
                </div>
              )}

              {/* Habilidades: poseídas vs faltantes según la IA */}
              {(missing.length > 0 || ownedSkills.length > 0) && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Habilidades
                  </h4>
                  {ownedSkills.length > 0 && (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Las posees ({ownedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ownedSkills.slice(0, 12).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {missing.length > 0 && (
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Faltantes según la IA ({missing.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {missing.slice(0, 12).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Descripción */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Descripción del puesto
                </h4>
                {job.description ? (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {job.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    La oferta no trae descripción. Ábrela en su web original
                    para ver el detalle completo.
                  </p>
                )}
                {job.originalUrl && (
                  <a
                    href={job.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver oferta original
                  </a>
                )}
              </div>

              {/* Footer: estado + CTA a la pestaña de CV */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2 pt-3">
                  <span className="text-xs text-slate-400 font-medium">
                    Estado:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onMoveStatus?.(job.id, opt.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          job.status === opt.id
                            ? "bg-aplika-lima-500 text-aplika-night-950"
                            : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab("cv")}
                  className="sm:ml-auto mt-1 sm:mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-aplika-lima-500 hover:bg-aplika-lima-400 text-aplika-night-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ver CV optimizado para esta vacante
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURRÍCULUM VITAE ATS (optimizado por IA, fallback clásico) */}
          {activeTab === "cv" && (
            <div className="flex flex-col gap-4">
              {!canOptimize && (
                <p className="text-xs text-slate-400">
                  {job.jobOfferId
                    ? "El optimizador IA no está disponible en este momento: te mostramos tu CV clásico."
                    : "Esta oferta no tiene identificador de vacante (jobOfferId), así que no se puede adaptar con IA. Te mostramos tu CV clásico."}
                </p>
              )}
              <CvViewer
                cv={legacyCv}
                optimizedData={optimizedCvData}
                isLoadingOptimized={Boolean(
                  cvRequestMatches && optimizer?.isLoadingCv,
                )}
                optimizedError={cvErrorForThisJob}
                onRegenerate={canOptimize ? handleRegenerateCv : undefined}
              />
            </div>
          )}

          {/* TAB 3: CARTA DE PRESENTACIÓN (generada por IA, fallback plantilla) */}
          {activeTab === "cover_letter" && (
            <div className="flex flex-col gap-4">
              {!canOptimize && (
                <p className="text-xs text-slate-400">
                  Sin jobOfferId no se puede generar una carta personalizada con
                  IA: te mostramos la plantilla base.
                </p>
              )}
              {letterErrorForThisJob && (
                <p className="text-xs text-red-400">{letterErrorForThisJob}</p>
              )}
              <CoverLetterViewer
                job={job}
                coverLetterData={letterData}
                isLoading={Boolean(
                  letterRequestMatches && optimizer?.isLoadingLetter,
                )}
                onRegenerate={canOptimize ? handleRegenerateLetter : undefined}
                targetRole={cv?.targetRole}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}


