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
import JobDetailModal, { type OptimizerPort } from "./kanban/JobDetailModal";
import type { JobApplication, ColumnStatus } from "../types/kanban";

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
  /** Optimizador IA (hook useOptimizer) para las pestañas de CV y carta. */
  optimizer?: OptimizerPort | null;
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
  optimizer = null,
}: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  // Fase 3: guardamos solo el id y derivamos la tarjeta del listado actual.
  // Así el modal abierto ve siempre datos frescos (evaluate/matcher/edición)
  // sin efectos de sincronización, y se cierra solo si la tarjeta desaparece.
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

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
                    onClick={() => setSelectedJobId(job.id)}
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
          <div className="rotate-2 scale-105 shadow-2xl shadow-aplika-lima-500/25 ring-2 ring-aplika-lima-500/60 rounded-2xl">
            <KanbanCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>

      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJobId(null)}
        onMoveStatus={onMoveJob}
        onRefresh={onRefresh}
        optimizer={optimizer}
      />
    </DndContext>
  );
}
