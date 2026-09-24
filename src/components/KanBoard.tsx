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
import { AlertCircle, PlusCircle } from "lucide-react";

// Componentes y Tipos
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import SkeletonCard from "./ui/SkeletonCard";
import Modal from "./ui/Modal";
import CvViewer from "./ui/CvViewer";
import type { JobApplication, ColumnStatus } from "../types/kanban";

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "por_revisar", title: "Por Revisar" },
  { id: "aplicado", title: "Aplicado" },
  { id: "entrevista", title: "Entrevistas" },
  { id: "oferta", title: "Ofertas" },
];

interface KanbanBoardProps {
  jobs: JobApplication[];
  isLoading?: boolean;
  syncError?: string | null;
  onMoveJob: (jobId: string, newStatus: ColumnStatus) => void;
  onEditJob?: (job: JobApplication) => void;
  onDeleteJob?: (job: JobApplication) => void;
  searchQuery?: string;
}

export default function KanbanBoard({
  jobs,
  isLoading = false,
  syncError = null,
  onMoveJob,
  onEditJob,
  onDeleteJob,
  searchQuery = "",
}: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [viewCvJob, setViewCvJob] = useState<JobApplication | null>(null);

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
      {/* Contenedor horizontal de columnas */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 h-full scrollbar-thin">
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

      {/* Toast de Sincronización o Error */}
      {syncError && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium border border-red-500/40 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{syncError}</span>
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

      {/* Modal de CV Adaptado por Empresa si se selecciona */}
      <Modal
        isOpen={Boolean(viewCvJob)}
        onClose={() => setViewCvJob(null)}
        title={
          viewCvJob ? `CV Adaptado para ${viewCvJob.company} ✨` : "Cargando..."
        }
        subtitle="Currículum reestructurado con palabras clave y formato ATS según los requerimientos de la vacante."
      >
        {viewCvJob && (
          <CvViewer
            cv={{
              fullName: "Roberto Antonio López Calatayud",
              targetRole: viewCvJob.position,
              summary: `Versión adaptada del currículum específicamente optimizada para el rol de ${viewCvJob.position} en ${viewCvJob.company}. Estructura semántica de alta legibilidad para sistemas ATS y equipos de reclutamiento técnico.`,
              experience: [
                {
                  id: "1",
                  role: "Frontend Engineer",
                  company: "Talent-AI Platform",
                  period: "2026 - Presente",
                  achievements: [
                    "Implementación de arquitectura Frontend avanzada con React 19, TypeScript y @dnd-kit.",
                    `Optimización de interfaz gráfica enfocada en las tecnologías requeridas por ${viewCvJob.company}.`,
                    "Desarrollo de exportación dinámica de documentos A4 en PDF (Client-Side Rendering) de alta resolución.",
                  ],
                },
              ],
              skills: viewCvJob.tags || [
                "React 19",
                "TypeScript",
                "Tailwind CSS",
                "Node.js",
              ],
            }}
          />
        )}
      </Modal>
    </DndContext>
  );
}
