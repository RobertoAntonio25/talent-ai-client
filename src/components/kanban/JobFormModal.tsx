import { useState, type FormEvent } from "react";
import {
  Plus,
  Save,
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";
import Modal from "../ui/Modal";
import type { JobApplication, ColumnStatus } from "../../types/kanban";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    jobData: Omit<JobApplication, "id" | "date"> & { id?: string },
  ) => void;
  initialJob?: JobApplication | null;
}

interface FormContentProps {
  onClose: () => void;
  onSubmit: (
    jobData: Omit<JobApplication, "id" | "date"> & { id?: string },
  ) => void;
  initialJob?: JobApplication | null;
}

function JobFormContent({ onClose, onSubmit, initialJob }: FormContentProps) {
  const isEditing = Boolean(initialJob);

  const [company, setCompany] = useState(initialJob?.company || "");
  const [position, setPosition] = useState(initialJob?.position || "");
  const [status, setStatus] = useState<ColumnStatus>(
    initialJob?.status || "por_revisar",
  );
  const [location, setLocation] = useState(initialJob?.location || "Remoto");
  const [salary, setSalary] = useState(initialJob?.salary || "");
  const [tagsInput, setTagsInput] = useState(
    initialJob?.tags ? initialJob.tags.join(", ") : "",
  );
  const [notes, setNotes] = useState(initialJob?.notes || "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      id: initialJob?.id,
      company: company.trim(),
      position: position.trim(),
      status,
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Empresa */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Empresa *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej. Spotify, Stripe, Google"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Posición / Rol */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Puesto o Cargo *
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ej. Senior Frontend Developer"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Estado de la Columna */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Estado inicial
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ColumnStatus)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="por_revisar">Por Revisar</option>
            <option value="aplicado">Aplicado</option>
            <option value="entrevista">Entrevista</option>
            <option value="oferta">Oferta</option>
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ubicación / Modalidad
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Remoto, Madrid"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Salario */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Rango Salarial
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Ej. €50k - €60k"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Tecnologías / Etiquetas (separadas por comas)
        </label>
        <div className="relative">
          <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="React, TypeScript, Tailwind, Node.js"
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Notas adicionales
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles sobre el proceso, contacto de reclutador o requisitos clave..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        >
          {isEditing ? (
            <Save className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{isEditing ? "Guardar Cambios" : "Crear Postulación"}</span>
        </button>
      </div>
    </form>
  );
}

export default function JobFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob,
}: JobFormModalProps) {
  const isEditing = Boolean(initialJob);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar postulación" : "Nueva postulación"}
      subtitle={
        isEditing
          ? "Actualiza los detalles y el seguimiento de esta vacante."
          : "Agrega una nueva oportunidad a tu tablero Kanban."
      }
    >
      <JobFormContent
        key={initialJob?.id || "new-job"}
        onClose={onClose}
        onSubmit={onSubmit}
        initialJob={initialJob}
      />
    </Modal>
  );
}
