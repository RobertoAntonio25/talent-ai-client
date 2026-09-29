// KanbanCard.tsx
import { useState, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  Calendar,
  GripVertical,
  Sparkles,
  MapPin,
  DollarSign,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import type { JobApplication } from "../types/kanban";

interface Props {
  job: JobApplication;
  onClick?: (job: JobApplication) => void;
  onEdit?: (job: JobApplication) => void;
  onDelete?: (job: JobApplication) => void;
}

// Genera un color consistente según el nombre de la empresa para el avatar
const getCompanyBadgeColor = (name: string) => {
  const colors = [
    "from-blue-600 to-cyan-600 text-cyan-100",
    "from-purple-600 to-indigo-600 text-indigo-100",
    "from-emerald-600 to-teal-600 text-teal-100",
    "from-amber-600 to-orange-600 text-orange-100",
    "from-rose-600 to-pink-600 text-pink-100",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function KanbanCard({ job, onClick, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: job,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const badgeColor = getCompanyBadgeColor(job.company);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    // Si hubo un arrastre perceptible mayor a 6px, descartar click
    if (dragStartPos.current) {
      const dist = Math.hypot(
        e.clientX - dragStartPos.current.x,
        e.clientY - dragStartPos.current.y
      );
      if (dist > 6) return;
    }
    onClick(job);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        handlePointerDown(e);
        listeners?.onPointerDown?.(e);
      }}
      onClick={handleClick}
      className={`relative flex flex-col bg-slate-900/90 rounded-2xl border p-4 transition-all duration-200 group cursor-pointer active:cursor-grabbing backdrop-blur-sm select-none
        ${
          isDragging
            ? "opacity-30 border-2 border-dashed border-blue-500 shadow-none z-0"
            : "border-slate-800/90 shadow-md shadow-slate-950/40 hover:border-blue-500/50 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-0.5 z-10"
        }
      `}
    >
      {/* Top Header: Company Avatar + Name & Drag Grip / Actions */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${badgeColor} flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}
          >
            {job.company.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-300 truncate block">
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center text-[11px] text-slate-500 truncate">
                <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0 text-slate-500" />
                {job.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {job.matchScore && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-400" />
              {job.matchScore}%
            </span>
          )}

          {/* Menú de Acciones (Editar / Eliminar) */}
          {(onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Opciones de la tarjeta"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute right-0 top-6 z-50 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(job);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 text-left transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(job);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-slate-600 opacity-40 group-hover:opacity-100 group-hover:text-slate-400 transition-opacity pl-0.5">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Position Title */}
      <h4 className="font-bold text-slate-100 text-sm mb-2 group-hover:text-blue-400 transition-colors leading-snug">
        {job.position}
      </h4>

      {/* Tags / Stack */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-500">
              +{job.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Salary & Date */}
      <div className="mt-auto pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        {job.salary ? (
          <span className="flex items-center text-slate-300 font-medium">
            <DollarSign className="w-3 h-3 mr-0.5 text-emerald-400" />
            {job.salary}
          </span>
        ) : (
          <span className="flex items-center text-slate-500">
            <Building2 className="w-3 h-3 mr-1 text-slate-600" />
            Full-time
          </span>
        )}

        <span className="flex items-center">
          <Calendar className="w-3 h-3 mr-1 text-slate-600" />
          {job.date}
        </span>
      </div>
    </div>
  );
}
