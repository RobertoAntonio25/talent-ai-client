// src/components/ui/CvViewer.tsx
import { useState, useRef } from "react";
import { Copy, CheckCheck, Download } from "lucide-react";
import type { GeneratedCV } from "../../types/cv";

interface CvViewerProps {
  cv: GeneratedCV;
}

export default function CvViewer({ cv }: CvViewerProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Referencia al contenedor principal del CV para extraer su texto
  const cvRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE COPIADO ---
  const handleCopy = async () => {
    if (!cvRef.current) return;

    try {
      // .innerText extrae el texto visible sin etiquetas HTML,
      // manteniendo los saltos de línea. ¡Perfecto para pegar en InfoJobs!
      const textToCopy = cvRef.current.innerText;
      await navigator.clipboard.writeText(textToCopy);

      setIsCopied(true);
      // Devolvemos el botón a su estado normal después de 2 segundos
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  // --- LÓGICA DE PDF ---
  const handleDownloadPDF = () => {
    // window.print() abre el diálogo de impresión del navegador.
    // Usaremos clases de Tailwind (print:hidden) para ocultar lo que no queremos en el PDF.
    window.print();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 🛠️ BARRA DE HERRAMIENTAS (Se oculta al imprimir el PDF) */}
      <div className="flex items-center justify-end gap-3 print:hidden">
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Guardar PDF</span>
        </button>
      </div>

      {/* 📄 EL DOCUMENTO (Este div es el que se copiará y se imprimirá) */}
      <article
        ref={cvRef}
        className="bg-white text-slate-800 font-sans leading-relaxed max-w-3xl mx-auto border border-slate-200 rounded-lg shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0"
      >
        {/* Cabecera */}
        <header className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
            {cv.fullName}
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-blue-600 mt-2">
            {cv.targetRole}
          </h2>
        </header>

        {/* Resumen */}
        <section className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-3">
            Resumen Profesional
          </h3>
          <p className="text-slate-600 text-sm sm:text-base text-justify">
            {cv.summary}
          </p>
        </section>

        {/* Experiencia */}
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

        {/* Habilidades */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Habilidades Técnicas
          </h3>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, index) => (
              <span
                key={index}
                // En pantalla se ve con fondo gris, en impresión (print:) se ve con borde para ahorrar tinta
                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-md border border-slate-200 print:bg-transparent print:border-slate-400"
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
