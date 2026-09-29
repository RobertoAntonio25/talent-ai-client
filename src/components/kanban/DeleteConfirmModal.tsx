import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import type { JobApplication } from "../../types/kanban";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  job: JobApplication | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  job,
}: DeleteConfirmModalProps) {
  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar postulación"
      subtitle="Esta acción quitará la tarjeta de tu tablero Kanban."
    >
      <div className="space-y-5 p-2">
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              ¿Confirmas la eliminación?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vas a eliminar la postulación para{" "}
              <strong className="text-white">{job.position}</strong> en{" "}
              <strong className="text-white">{job.company}</strong>. Podrás
              volver a agregarla en cualquier momento si lo necesitas.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sí, eliminar postulación</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
