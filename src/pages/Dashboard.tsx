import { useState } from "react";
import {
  Sparkles,
  Search,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  Filter,
} from "lucide-react";
import KanbanBoard from "../components/KanBoard";
import Modal from "../components/ui/Modal";
import CvViewer from "../components/ui/CvViewer";
import type { GeneratedCV } from "../types/cv";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const MOCK_CV: GeneratedCV = {
    fullName: "Roberto López",
    targetRole: "Frontend Developer (React / TypeScript)",
    summary:
      "Desarrollador frontend con base en Madrid especializado en la creación de interfaces dinámicas, reactivas y de alto rendimiento. Enfoque centrado en la experiencia de usuario (UX), arquitecturas optimistas y código tipado mantenible. Pasión por la integración de herramientas de IA en flujos de trabajo web.",
    experience: [
      {
        id: "1",
        role: "Frontend Engineer",
        company: "Talent-AI Platform",
        period: "Ago 2026 - Presente",
        achievements: [
          "Desarrollo de Panel Kanban interactivo con drag-and-drop de alta precisión usando React 19, TypeScript y @dnd-kit.",
          "Implementación de arquitectura Optimistic UI reduciendo la latencia percibida por el usuario a 0ms.",
          "Integración de exportación de currículums ATS en PDF de alta fidelidad con html-to-image y jsPDF.",
        ],
      },
      {
        id: "2",
        role: "Desarrollador Web Fullstack",
        company: "Tech Solutions Hub",
        period: "Ene 2025 - Jul 2026",
        achievements: [
          "Diseño e integración de APIs RESTful con Node.js, Express y bases de datos PostgreSQL con Prisma ORM.",
          "Optimización de bundle sizes y tiempos de carga de primera pintura (FCP) en un 40% mediante Vite y Tailwind CSS.",
        ],
      },
    ],
    skills: [
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Prisma ORM",
      "dnd-kit",
      "Git & GitHub",
      "REST APIs",
      "CI/CD Vercel",
    ],
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 🌟 ENCABEZADO Y ACCIONES RÁPIDAS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

        {/* Botón Destacado: Ver CV con IA */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 active:scale-95 group"
        >
          <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
          <span>Ver CV Optimizado con IA</span>
        </button>
      </div>

      {/* 📊 BARRA DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Postulaciones
            </span>
            <span className="text-xl font-bold text-white">5</span>
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
            <span className="text-xl font-bold text-white">1</span>
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
            <span className="text-xl font-bold text-emerald-400">1</span>
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
            <span className="text-xl font-bold text-amber-300">94%</span>
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
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Arrastra y suelta tarjetas para actualizar el estado</span>
        </div>
      </div>

      {/* 📋 TABLERO KANBAN */}
      <div className="w-full">
        <KanbanBoard searchQuery={searchQuery} />
      </div>

      {/* ✨ MODAL DE CV OPTIMIZADO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Currículum Optimizado por Talent-AI ✨"
        subtitle="Generado automáticamente con palabras clave y formato ATS según tu perfil profesional."
      >
        <CvViewer cv={MOCK_CV} />
      </Modal>
    </div>
  );
}
