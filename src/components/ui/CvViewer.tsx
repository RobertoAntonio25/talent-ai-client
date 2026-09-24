// src/components/ui/CvViewer.tsx
import { useState, useRef } from "react";
import { Copy, CheckCheck, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { GeneratedCV } from "../../types/cv";

interface CvViewerProps {
  cv: GeneratedCV;
}

export default function CvViewer({ cv }: CvViewerProps) {
  const [isCopied, setIsCopied] = useState(false);

  // NUEVO ESTADO: Para el feedback de carga del PDF
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const cvRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE COPIADO AL PORTAPAPELES (Sin cambios) ---
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

  // --- NUEVA LÓGICA DE PDF (Descarga Directa) ---
  const handleDownloadPDF = async () => {
    const element = cvRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);

    try {
      // 1. Usamos toPng de html-to-image.
      // pixelRatio: 2 asegura calidad Retina/4K para que el texto no se vea pixelado.
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff", // Forzamos fondo blanco por si acaso
      });

      // 2. Creamos el documento A4
      const pdf = new jsPDF("p", "mm", "a4");

      // 3. Matemáticas para escalar la imagen al tamaño perfecto del A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      // 4. Inyectamos la imagen y descargamos
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `${cv.fullName.replace(/\s+/g, "_")}_CV.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generando el PDF:", error);
      alert("Hubo un error al generar el PDF. Revisa la consola.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      {/* 🛠️ BARRA DE HERRAMIENTAS */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors active:scale-95"
        >
          {isCopied ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Texto</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf} // Deshabilitamos para evitar doble clic
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm active:scale-95 disabled:bg-blue-400 disabled:cursor-not-allowed w-[150px] justify-center"
        >
          {/* Micro-interacción: Cambia el icono de descarga por un spinner rotando */}
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Guardar PDF</span>
            </>
          )}
        </button>
      </div>

      {/* 📄 EL DOCUMENTO (Ya no necesitamos las clases 'print:' de Tailwind porque ya no usamos window.print) */}
      <article
        ref={cvRef}
        className="bg-white text-slate-800 font-sans leading-relaxed max-w-3xl mx-auto border border-slate-200 rounded-lg shadow-sm p-8 sm:p-12"
      >
        <header className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
            {cv.fullName}
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-blue-600 mt-2">
            {cv.targetRole}
          </h2>
        </header>

        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-3">
            Resumen Profesional
          </h3>
          <p className="text-slate-600 text-sm sm:text-base text-justify">
            {cv.summary}
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Experiencia Relevante
          </h3>
          <div className="space-y-6">
            {cv.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                  <h4 className="font-bold text-slate-800 text-base">
                    {exp.role}{" "}
                    <span className="font-normal text-slate-500">
                      en {exp.company}
                    </span>
                  </h4>
                  <span className="text-sm font-semibold text-blue-600">
                    {exp.period}
                  </span>
                </div>
                <ul className="list-disc list-outside ml-5 text-sm text-slate-600 space-y-1.5 marker:text-slate-400">
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

        <section>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Habilidades Técnicas
          </h3>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-md border border-slate-200"
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
