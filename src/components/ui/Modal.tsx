// src/components/ui/Modal.tsx
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // Esto permite meter cualquier HTML/Componente adentro
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  // 1. Cerrar con la tecla Escape.
  // 2. Bloquear el scroll del fondo cuando el modal está abierto.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Bloquea el scroll de la página
    }

    // Cleanup: Función de limpieza cuando el componente se desmonta o se cierra
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // Devuelve el scroll a la normalidad
    };
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizamos nada (retorna null)
  if (!isOpen) return null;

  return (
    // 1. El "Backdrop" (Fondo oscuro semitransparente)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose} // Si hace clic afuera, se cierra
    >
      {/* 2. La Caja del Modal */}
      <div
        // StopPropagation evita que al hacer clic DENTRO de la caja blanca, se cierre el modal
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Cabecera (Header) */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo (Content) - Aquí irá nuestro CV */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
