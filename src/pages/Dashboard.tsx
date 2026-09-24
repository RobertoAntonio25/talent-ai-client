import { useState } from "react";
import KanbanBoard from "../components/KanBoard";
import Modal from "../components/ui/Modal";
import CvViewer from "../components/ui/CvViewer";

export default function Dashboard() {
  // 2. Crea los datos falsos
  const MOCK_CV = {
    fullName: "Roberto López",
    targetRole: "Frontend Developer (React/TypeScript)",
    summary:
      "Desarrollador web con base en Madrid especializado en la creación de interfaces dinámicas y escalables. Transición exitosa desde el sector creativo (Producción Musical), aportando una visión única sobre la experiencia de usuario y la resolución de problemas estructurada.",
    experience: [
      {
        id: "1",
        role: "Desarrollador Web Bootcamp",
        company: "Talent-AI Training",
        period: "Ago 2026 - Presente",
        achievements: [
          "Desarrollo de Panel Kanban interactivo utilizando React, TypeScript y @dnd-kit.",
          "Implementación de base de datos PostgreSQL con Prisma ORM y autenticación JWT.",
          "Diseño de arquitectura Optimistic UI reduciendo la latencia percibida en un 100%.",
        ],
      },
    ],
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma ORM",
      "Git",
      "Tailwind CSS",
    ],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">Tu Panel de Empleo</h2>
      <p className="text-slate-400">
        <KanbanBoard />
      </p>

      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-4 bg-blue-600 text-white rounded-lg m-10"
        >
          Probar Modal
        </button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Optimización completada con IA ✨"
        >
          <CvViewer cv={MOCK_CV} />
        </Modal>
      </div>
    </div>
  );
}
