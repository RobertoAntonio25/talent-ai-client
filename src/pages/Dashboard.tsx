import { useState } from "react";
import {
  Sparkles,
  Search,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  Plus,
  RefreshCw,
} from "lucide-react";
import KanbanBoard from "../components/KanBoard";
import Modal from "../components/ui/Modal";
import CvViewer from "../components/ui/CvViewer";
import EmptyCvState from "../components/ui/EmptyCvState";
import JobFormModal from "../components/kanban/JobFormModal";
import DeleteConfirmModal from "../components/kanban/DeleteConfirmModal";
import { useJobs } from "../hooks/useJobs";
import { useCv } from "../hooks/useCv";
import { useOptimizer } from "../hooks/useOptimizer.hook";
import type { JobApplication } from "../types/kanban";

export default function Dashboard() {
  const {
    jobs,
    isLoading,
    syncError,
    fetchJobs,
    moveJob,
    deleteJob,
    addJob,
    updateJob,
  } = useJobs();

  const { cv, isUploading, uploadError, upload } = useCv();
  // Fase 3: optimizador ATS (Fase 2) consumido por el JobDetailModal del Kanban.
  const optimizer = useOptimizer();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobApplication | null>(null);

  // Métricas calculadas dinámicamente
  const totalJobs = jobs.length;
  const inInterview = jobs.filter((j) => j.status === "entrevista").length;
  const inOffer = jobs.filter((j) => j.status === "oferta").length;
  // 6.3: sin defaulteo engañoso. null = "sin datos" (tablero vacío real).
  const jobsWithScore = jobs.filter((j) => typeof j.matchScore === "number");
  const avgMatch: number | null =
    jobsWithScore.length > 0
      ? Math.round(
          jobsWithScore.reduce((acc, j) => acc + (j.matchScore as number), 0) /
            jobsWithScore.length,
        )
      : null;

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (job: JobApplication) => {
    setEditingJob(job);
    setIsFormModalOpen(true);
  };

  const handleSaveJob = (
    jobData: Omit<JobApplication, "id" | "date"> & { id?: string },
  ) => {
    if (jobData.id) {
      updateJob(jobData.id, jobData);
    } else {
      addJob(jobData);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingJob) {
      deleteJob(deletingJob.id);
      setDeletingJob(null);
    }
  };

  const handleCvUpload = (file: File) => {
    void upload(file).catch(() => {});
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 🌟 ENCABEZADO Y ACCIONES RÁPIDAS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tablero de Postulaciones
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gestiona tu pipeline de empleo y optimiza tu perfil con inteligencia
            artificial.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchJobs()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Recargar ofertas y postulaciones"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Agrega una nueva oferta manualmente"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Agregar Oferta</span>
          </button>

          <button
            onClick={() => setIsCvModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 active:scale-95 group cursor-pointer"
            title="Tu CV genérico Potenciado con IA para pasar los filtros ATS"
          >
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
            <span>Ver CV Optimizado con IA</span>
          </button>
        </div>
      </div>

      {/* 📊 BARRA DE MÉTRICAS RÁPIDAS DINÁMICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total de Ofertas
            </span>
            <span className="text-xl font-bold text-white">
              {isLoading ? "-" : totalJobs}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              En Entrevista
            </span>
            <span className="text-xl font-bold text-white">
              {isLoading ? "-" : inInterview}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ofertas Recibidas
            </span>
            <span className="text-xl font-bold text-emerald-400">
              {isLoading ? "-" : inOffer}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Match IA Promedio
            </span>
            <span className="text-xl font-bold text-amber-300">
              {isLoading ? "-" : avgMatch !== null ? `${avgMatch}%` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y FILTRO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa, rol o tecnología..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
          <span>Arrastra y suelta tarjetas para mover de estado</span>
        </div>
      </div>

      {/* 📋 TABLERO KANBAN CON SKELETONS Y MANEJADORES */}
      <div className="w-full">
        <KanbanBoard
          jobs={jobs}
          isLoading={isLoading}
          syncError={syncError}
          onMoveJob={moveJob}
          onEditJob={handleOpenEditModal}
          onDeleteJob={(job) => setDeletingJob(job)}
          onRetry={fetchJobs}
          onRefresh={fetchJobs}
          searchQuery={searchQuery}
          optimizer={optimizer}
        />
      </div>

      {/* ✨ MODAL DE CV OPTIMIZADO */}
      <Modal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        title="Currículum Optimizado por Talent-AI ✨"
        subtitle="Generado automáticamente con palabras clave y formato ATS según tu perfil profesional."
      >
        {!cv ? (
          <EmptyCvState
            isUploading={isUploading}
            uploadError={uploadError}
            onUpload={handleCvUpload}
          />
        ) : (
          <>
            {!isUploading && (
              <p className="mb-4 text-xs text-emerald-400">
                CV cargado desde tu último análisis.
              </p>
            )}
            <CvViewer cv={cv} />
          </>
        )}
      </Modal>

      {/* 📝 MODAL DE CREACIÓN / EDICIÓN DE POSTULACIÓN */}
      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveJob}
        initialJob={editingJob}
      />

      {/* 🗑️ MODAL DE CONFIRMACIÓN DE BORRADO */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingJob)}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDeleteConfirm}
        job={deletingJob}
      />
    </div>
  );
}
