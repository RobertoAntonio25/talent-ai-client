// src/components/ui/CvViewer.tsx
import { useState, useRef } from "react";
import {
  Copy,
  CheckCheck,
  Download,
  Loader2,
  Sparkles,
  Briefcase,
  Code2,
  User,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { GeneratedCV } from "../../types/cv";

interface CvViewerProps {
  cv: GeneratedCV;
}

export default function CvViewer({ cv }: CvViewerProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  // --- COPIADO AL PORTAPAPELES ---
  const handleCopy = async () => {
    if (!cvRef.current) return;
    try {
      const textToCopy = cvRef.current.innerText;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  // --- DESCARGA PDF ---
  const handleDownloadPDF = async () => {
    const element = cvRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);

    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `${cv.fullName.replace(/\s+/g, "_")}_CV_Optimizado.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generando el PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 🛠️ BARRA DE HERRAMIENTAS MODERNA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">
            Formato ATS Compatible
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-blue-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" /> 98% Match IA
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95 border border-slate-700/80"
          >
            {isCopied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF (A4)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 📄 EL DOCUMENTO CV ESTILO TECH */}
      <article
        ref={cvRef}
        className="bg-white text-slate-800 font-sans leading-relaxed max-w-3xl mx-auto border border-slate-200 rounded-2xl shadow-xl p-8 sm:p-12 relative overflow-hidden"
      >
        {/* Barra superior de acento decorativa */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400" />

        {/* Encabezado del CV */}
        <header className="border-b border-slate-200 pb-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {cv.fullName}
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-blue-600 mt-1">
            {cv.targetRole}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-3 font-medium">
            <span>Madrid, España</span>
            <span>•</span>
            <span>roberto@talent-ai.dev</span>
            <span>•</span>
            <span>linkedin.com/in/roberto-lopez</span>
            <span>•</span>
            <span>github.com/RobertoAntonio25</span>
          </div>
        </header>

        {/* Resumen Profesional */}
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-2.5">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resumen Profesional
            </h3>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
            {cv.summary}
          </p>
        </section>

        {/* Experiencia */}
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-100 pb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Experiencia Relevante
            </h3>
          </div>
          <div className="space-y-5">
            {cv.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {exp.role}{" "}
                    <span className="font-normal text-slate-500">
                      • {exp.company}
                    </span>
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 mt-1 sm:mt-0 w-fit">
                    {exp.period}
                  </span>
                </div>
                <ul className="list-disc list-outside ml-4 text-xs sm:text-sm text-slate-600 space-y-1.5 marker:text-blue-500">
                  {exp.achievements.map((achievement, index) => (
                    <li key={index} className="pl-1">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Habilidades Técnicas */}
        <section>
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Habilidades Técnicas
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
