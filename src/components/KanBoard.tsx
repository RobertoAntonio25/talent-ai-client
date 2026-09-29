import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AlertCircle, PlusCircle, FileText, Mail } from "lucide-react";

// Componentes y Tipos
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import SkeletonCard from "./ui/SkeletonCard";
import Modal from "./ui/Modal";
import CvViewer from "./ui/CvViewer";
import CoverLetterViewer from "./ui/CoverLetterViewer";
import type { JobApplication, ColumnStatus } from "../types/kanban";
import { evaluateMatch } from "../services/aiService";

interface KanbanBoardProps {
  jobs: JobApplication[];
  isLoading?: boolean;
  syncError?: string | null;
  onMoveJob: (jobId: string, newStatus: ColumnStatus) => void;
  onEditJob?: (job: JobApplication) => void;
  onDeleteJob?: (job: JobApplication) => void;
  onRetry?: () => void;
  onRefresh?: () => void;
  searchQuery?: string;
}

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "por_revisar", title: "Por Revisar" },
  { id: "aplicado", title: "Aplicado" },
  { id: "entrevista", title: "Entrevistas" },
  { id: "oferta", title: "Ofertas" },
];

export default function KanbanBoard({
  jobs,
  isLoading = false,
  syncError = null,
  onMoveJob,
  onEditJob,
  onDeleteJob,
  onRetry,
  onRefresh,
  searchQuery = "",
}: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [activeTab, setActiveTab] = useState<"cv" | "cover_letter">("cv");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalMsg, setEvalMsg] = useState<string | null>(null);
  // Sensores para Drag & Drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as ColumnStatus;

    const jobToMove = jobs.find((j) => j.id === jobId);
    if (!jobToMove || jobToMove.status === newStatus) return;

    onMoveJob(jobId, newStatus);
  };

  const handleEvaluate = async () => {
    if (!selectedJob?.jobOfferId || isEvaluating) return;
    setIsEvaluating(true);
    setEvalMsg(null);
    try {
      const res = await evaluateMatch(selectedJob.jobOfferId);
      setEvalMsg(
        res.isMatch
          ? `✓ Match ${res.score}% — ${res.reason ?? "compatible con tu perfil."}`
          : `✗ Sin match (${res.score}%). Faltan: ${(res.missingSkills ?? []).slice(0, 5).join(", ") || "—"}`,
      );
      onRefresh?.();
    } catch (e) {
      setEvalMsg(e instanceof Error ? e.message : "Error al evaluar.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Filtrado por búsqueda
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      (job.tags && job.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Contenedor responsivo de columnas: flex táctil en móviles, grid de 4 columnas en xl+ */}
      <div className="flex xl:grid xl:grid-cols-4 gap-4 overflow-x-auto xl:overflow-x-visible pb-6 pt-2 w-full scrollbar-thin">
        {COLUMNS.map((col) => {
          const jobsInColumn = filteredJobs.filter(
            (job) => job.status === col.id,
          );

          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={isLoading ? 0 : jobsInColumn.length}
            >
              {isLoading ? (
                // 🌟 SKELETON LOADING (Animación de carga inicial)
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : jobsInColumn.length > 0 ? (
                jobsInColumn.map((job) => (
                  <KanbanCard
                    key={job.id}
                    job={job}
                    onClick={() => {
                      setSelectedJob(job);
                      setActiveTab("cv");
                    }}
                    onEdit={onEditJob}
                    onDelete={onDeleteJob}
                  />
                ))
              ) : (
                <div className="h-40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Sin postulaciones
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Arrastra una tarjeta aquí
                  </p>
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>

      {/* Toast de Error con Reintentar (6.2: no borra tablero, permite retry) */}
      {syncError && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-[92vw]">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium border border-red-500/40 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="break-words">{syncError}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="ml-1 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-100 font-semibold transition-colors flex-shrink-0"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fantasma de arrastre (Overlay) */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeJob ? (
          <div className="rotate-2 scale-105 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/60 rounded-2xl">
            <KanbanCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Modal Interactivo con Tabs: CV Adaptado ATS + Carta de Presentación */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={
          selectedJob
            ? `${selectedJob.position} en ${selectedJob.company}`
            : "Postulación"
        }
        subtitle="Documentos de postulación optimizados por IA con formato ATS para esta vacante."
      >
        {selectedJob && (
          <div className="flex flex-col gap-5">
            {/* 5.4e: Evaluar match con IA */}
            {selectedJob.jobOfferId && (
              <div className="mb-1">
                <button
                  type="button"
                  onClick={() => void handleEvaluate()}
                  disabled={isEvaluating}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  {isEvaluating ? "Evaluando con IA…" : "✨ Evaluar match con mi CV"}
                </button>
                {evalMsg && (
                  <p className="mt-2 text-xs text-slate-300">{evalMsg}</p>
                )}
              </div>
            )}
            
            {/* Selector de Pestañas (Tabs) */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("cv")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "cv"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Currículum Vitae ATS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cover_letter")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "cover_letter"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Carta de Presentación</span>
              </button>
            </div>

            {/* Contenido según la pestaña activa */}
            {activeTab === "cv" ? (
              <CvViewer
                cv={{
                  fullName: "Roberto A. López Calatayud",
                  targetRole: selectedJob.position,
                  summary: `Desarrollador Full-Stack e Ingeniero Técnico especializado en la construcción de arquitecturas web SaaS escalables y flujos de integración continua. Currículum optimizado específicamente para el rol de ${selectedJob.position} en ${selectedJob.company}, alineando palabras clave y experiencias técnicas.`,
                  contact: {
                    email: "ralc.0595@gmail.com",
                    phone: "0034 614 88 94 73",
                    location: "Madrid, España",
                    linkedin: "linkedin.com/in/robertoantoniolopez25",
                    portfolio: "robertoantonioportfolio.vercel.app",
                  },
                  skills: selectedJob.tags || [
                    "React",
                    "TypeScript",
                    "Node.js",
                    "PostgreSQL",
                    "Docker",
                  ],
                  experience: [
                    {
                      id: "1",
                      role: "Desarrollador Full-Stack Freelance",
                      company:
                        "SmartBrains - Aplicación Web SaaS de Reconocimiento Facial",
                      period: "Noviembre 2025 – Enero 2026",
                      achievements: [
                        `Diseñé e implementé el ciclo de vida completo de un SaaS con tecnologías clave afines a ${selectedJob.company}, alcanzando más de 200 usuarios y 500 llamadas de API al día.`,
                        "Integré la REST API de visión artificial de Clarifai, reduciendo tiempos de respuesta en un 20%.",
                        "Arquitecté backend con persistencia relacional en PostgreSQL / Supabase con autenticación segura.",
                        "Automaticé pruebas funcionales y de integración con Jest, Postman y Cypress con 85% de cobertura.",
                      ],
                    },
                    {
                      id: "2",
                      role: "Ingeniero Técnico y Gestor de Proyectos de Sistemas (Freelance)",
                      company:
                        "Clientes internacionales en Estados Unidos y LATAM",
                      period: "Marzo 2016 – Actualidad",
                      achievements: [
                        "Administré la arquitectura técnica y QA de más de 50 proyectos internacionales, reduciendo errores en un 30%.",
                        "Reduje los tiempos de resolución de incidencias en un 20% mediante protocolos de troubleshooting estructurado.",
                        "Reduje los tiempos de entrega en un 15% aplicando metodologías Agile y Scrum en sprints quincenales.",
                        "Coordiné equipos técnicos remotos de hasta 10 personas utilizando Jira, Trello y metodologías ágiles.",
                      ],
                    },
                  ],
                }}
              />
            ) : (
              <CoverLetterViewer job={selectedJob} />
            )}
          </div>
        )}
      </Modal>
    </DndContext>
  );
}
