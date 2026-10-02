// src/components/ui/EmptyCvState.tsx
import { useRef, useState, type DragEvent } from "react";
import { FileUp, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface EmptyCvStateProps {
  isUploading: boolean;
  uploadError: string | null;
  onUpload: (file: File) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const BENEFITS = [
  "Extracción automática de habilidades técnicas y blandas.",
  "Cálculo de compatibilidad con ofertas en tiempo real.",
  "Generación de versiones optimizadas que superan filtros ATS.",
];

export default function EmptyCvState({
  isUploading,
  uploadError,
  onUpload,
}: EmptyCvStateProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSend = (file: File | undefined) => {
    if (!file || isUploading) return;
    if (file.type !== "application/pdf") {
      setLocalError("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError("El PDF supera los 10MB permitidos.");
      return;
    }
    setLocalError(null);
    onUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSend(e.dataTransfer.files?.[0]);
  };

  const error = localError ?? uploadError;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed p-6 sm:p-8 text-center transition-colors ${
        isDragging
          ? "border-aplika-lima-400 bg-aplika-lima-500/15"
          : "border-aplika-lima-500/40 bg-slate-900/60"
      } ${isUploading ? "opacity-90" : ""}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-aplika-lima-500/10 border border-aplika-lima-500/20 text-aplika-lima-400 flex items-center justify-center">
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <FileUp className="w-6 h-6" />
        )}
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-white">
          Aún no hay CV cargado
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Arrastra tu PDF aquí o selecciónalo para empezar
        </p>
      </div>

      {isUploading ? (
        <div className="w-full max-w-sm flex flex-col gap-2">
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-aplika-lima-500 to-aplika-lima-400 animate-pulse" />
          </div>
          <p className="text-xs text-aplika-lima-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Analizando tu perfil profesional con nuestra IA...
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-5 py-2.5 bg-aplika-lima-500 hover:bg-aplika-lima-400 text-aplika-night-950 font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-aplika-lima-500/25 transition-all active:scale-95"
        >
          Seleccionar CV en PDF (Máx. 10MB)
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => {
          validateAndSend(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <ul className="w-full max-w-sm flex flex-col gap-2 text-left">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
