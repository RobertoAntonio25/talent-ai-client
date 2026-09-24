// src/components/ui/Modal.tsx
import { useEffect, type ReactNode } from "react";
import { X, Sparkles } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // 1. Backdrop con efecto glassmorphism
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. Caja del Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden text-slate-100"
      >
        {/* Cabecera estilizada */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con scroll estilizado */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-950/40">
          {children}
        </div>
      </div>
    </div>
  );
}
