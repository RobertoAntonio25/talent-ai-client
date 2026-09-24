import { useState } from "react";
import KanbanBoard from "../components/KanBoard";
import Modal from "../components/ui/Modal";

export default function Dashboard() {
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
          title="CV Adaptado (Google - Frontend Dev)"
        >
          <p className="text-slate-600">Aquí irá el texto de la IA ...</p>
        </Modal>
      </div>
    </div>
  );
}
