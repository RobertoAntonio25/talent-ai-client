// src/components/profile/CvManager.tsx
// Fase 2c: gestiona el CV base (PDF vía back + alta manual en local).
import { useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2, Upload } from "lucide-react";
import { useCv } from "../../hooks/useCv";

export default function CvManager() {
  const { cv, isUploading, uploadError, upload, clear, saveManual } = useCv();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [fullName, setFullName] = useState(cv?.fullName ?? "");
  const [targetRole, setTargetRole] = useState(cv?.targetRole ?? "");
  const [summary, setSummary] = useState(cv?.summary ?? "");
  const [skillsText, setSkillsText] = useState(cv?.skills.join(", ") ?? "");

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    try {
      const up = await upload(file);
      setMsg(`✓ CV actualizado (${up.skills.length} habilidades).`);
    } catch {
      // Motivo en uploadError.
    }
  };

  const handleManualSave = () => {
    saveManual({ fullName, targetRole, summary, skillsText });
    setMsg("✓ CV manual guardado en este dispositivo.");
  };

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clear();
    setConfirming(false);
    setMsg("CV eliminado de este dispositivo.");
  };

  const inputCls =
    "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

  return (
    <section aria-label="Mi CV">
      <h2 className="font-bold text-white text-sm sm:text-base">Mi CV</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        Súbelo en PDF (la IA extrae tus datos) o créalo manualmente. PDF máx 10MB.
      </p>
      <p className={`text-xs mb-3 ${cv ? "text-emerald-400" : "text-slate-500"}`}>
        {cv ? `✓ ${cv.fullName || "CV"} — ${cv.skills.length} skills` : "Sin CV cargado"}
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? "Analizando…" : cv ? "Reemplazar PDF" : "Subir PDF"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!cv || isUploading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {confirming ? "¿Confirmar?" : "Eliminar"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => void handleFile(e)} />
      {uploadError && (
        <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{uploadError}</p>
      )}
      <div className="mt-5 border-t border-slate-800 pt-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">Alta manual</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-slate-400">Nombre completo</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Rol objetivo</span>
            <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block mt-3">
          <span className="text-xs text-slate-400">Resumen</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className={inputCls} />
        </label>
        <label className="block mt-3">
          <span className="text-xs text-slate-400">Habilidades (separadas por comas)</span>
          <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript, …" className={inputCls} />
        </label>
        <button
          type="button"
          onClick={handleManualSave}
          className="mt-3 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95 cursor-pointer"
        >
          Guardar CV manual
        </button>
      </div>
      {msg && !uploadError && (
        <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{msg}</p>
      )}
    </section>
  );
}
