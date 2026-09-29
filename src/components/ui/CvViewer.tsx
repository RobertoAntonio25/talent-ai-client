// src/components/ui/CvViewer.tsx
import { useState, useRef } from "react";
import {
  Copy,
  CheckCheck,
  Download,
  Loader2,
  Sparkles,
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

  const contact = cv.contact || {
    email: "ralc.0595@gmail.com",
    phone: "0034 614 88 94 73",
    location: "Madrid, España",
    linkedin: "linkedin.com/in/robertoantoniolopez25",
    portfolio: "robertoantonioportfolio.vercel.app",
  };

  const skillsCat = cv.skillsCategorized || {
    languages: ["JavaScript", "TypeScript"],
    frameworks: [
      "React",
      "Next.js",
      "Redux",
      "Node.js",
      "Express.js",
      "Cypress",
      "Jest",
      "React Testing Library",
    ],
    databases: ["PostgreSQL", "MongoDB", "Supabase"],
    tools: [
      "Docker",
      "Vercel",
      "AWS S3",
      "Git",
      "GitHub",
      "CI/CD Pipelines",
      "Postman",
      "Jira",
      "Trello",
      "Notion",
      "Slack",
    ],
    practices: [
      "Agile",
      "Scrum",
      "Kanban",
      "System Design",
      "Root Cause Analysis",
      "Troubleshooting",
    ],
  };

  const education = cv.education || [
    {
      institution: "Zero To Mastery Academy",
      period: "2023 – Actualidad",
      degree: "Certificación: Full-Stack Web Development Bootcamp (400 horas prácticas)",
    },
    {
      institution: "Tecnológico de Monterrey (ITESM), México",
      period: "2015 – 2019",
      degree: "Ingeniería en Producción Musical Digital",
      details:
        "Formación técnica especializada en lógica computacional aplicada, procesamiento de señales, sistemas digitales complejos e integración de hardware y software.",
    },
  ];

  const languages = cv.languages || [{ language: "Inglés", level: "C1" }];

  const generateCleanAtsText = () => {
    let text = `${cv.fullName.toUpperCase()}\n`;
    text += `${cv.targetRole}\n`;
    text += `${contact.email} | ${contact.phone} | ${contact.location} | ${contact.linkedin} | ${contact.portfolio}\n\n`;

    text += `HABILIDADES\n`;
    text += `Lenguajes: ${skillsCat.languages.join(", ")}\n`;
    text += `Frameworks: ${skillsCat.frameworks.join(", ")}\n`;
    text += `Bases de datos: ${skillsCat.databases.join(", ")}\n`;
    text += `Tecnologías / Herramientas: ${skillsCat.tools.join(", ")}\n`;
    text += `Prácticas: ${skillsCat.practices.join(", ")}\n\n`;

    text += `EXPERIENCIA\n`;
    cv.experience.forEach((exp) => {
      text += `${exp.company} | ${exp.period}\n`;
      text += `${exp.role}\n`;
      exp.achievements.forEach((ach) => {
        text += `• ${ach}\n`;
      });
      text += `\n`;
    });

    text += `EDUCACIÓN\n`;
    education.forEach((edu) => {
      text += `${edu.institution} | ${edu.period}\n`;
      text += `${edu.degree}\n`;
      if (edu.details) text += `${edu.details}\n`;
      text += `\n`;
    });

    text += `IDIOMAS\n`;
    languages.forEach((lang) => {
      text += `${lang.language}: ${lang.level}\n`;
    });

    return text.trim();
  };

  const handleCopy = async () => {
    try {
      const cleanText = generateCleanAtsText();
      await navigator.clipboard.writeText(cleanText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar texto ATS:", err);
    }
  };

  const handleDownloadPDF = async () => {
    const element = cvRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);

    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const cleanFileName = cv.fullName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
      pdf.save(`${cleanFileName}_CV_ATS.pdf`);
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
      <div className="w-full flex justify-center overflow-x-auto pb-4">
        <article
          ref={cvRef}
          className="bg-white text-black font-sans leading-relaxed w-[794px] min-w-[794px] p-10 border border-slate-200 shadow-xl relative select-text"
          style={{ boxSizing: "border-box" }}
        >
          {/* Encabezado ATS Oficial Roberto A. López Calatayud */}
          <header className="text-center pb-2 mb-3">
            <h1 className="text-2xl font-bold text-black tracking-tight uppercase">
              {cv.fullName}
            </h1>
            <p className="text-xs font-semibold text-black mt-0.5">
              {cv.targetRole}
            </p>
            <p className="text-[11px] text-black mt-1 leading-normal">
              {contact.email} | {contact.phone} | {contact.location} | {contact.linkedin} | {contact.portfolio}
            </p>
          </header>

          {/* Sección Habilidades Categorizadas */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Habilidades
            </h2>
            <div className="text-[11px] text-black space-y-0.5">
              <p>
                <strong className="font-bold">Lenguajes:</strong> {skillsCat.languages.join(", ")}
              </p>
              <p>
                <strong className="font-bold">Frameworks:</strong> {skillsCat.frameworks.join(", ")}
              </p>
              <p>
                <strong className="font-bold">Bases de datos:</strong> {skillsCat.databases.join(", ")}
              </p>
              <p>
                <strong className="font-bold">Tecnologías / Herramientas:</strong> {skillsCat.tools.join(", ")}
              </p>
              <p>
                <strong className="font-bold">Prácticas:</strong> {skillsCat.practices.join(", ")}
              </p>
            </div>
          </section>

          {/* Sección Experiencia Laboral */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Experiencia
            </h2>
            <div className="space-y-3">
              {cv.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-black">{exp.company}</span>
                    <span className="text-black font-medium">{exp.period}</span>
                  </div>
                  <div className="text-[11px] italic text-black mb-1">
                    {exp.role}
                  </div>
                  <ul className="list-disc list-outside ml-4 text-[11px] text-black space-y-1">
                    {exp.achievements.map((achievement, index) => (
                      <li key={index} className="leading-snug">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Sección Educación */}
          <section className="mb-3.5">
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Educación
            </h2>
            <div className="space-y-2 text-[11px] text-black">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">{edu.institution}</span>
                    <span className="font-medium">{edu.period}</span>
                  </div>
                  <p className="leading-snug">{edu.degree}</p>
                  {edu.details && (
                    <p className="text-[10px] text-black leading-snug mt-0.5">
                      {edu.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sección Idiomas */}
          <section>
            <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Idiomas
            </h2>
            <div className="text-[11px] text-black">
              {languages.map((lang, idx) => (
                <p key={idx}>
                  <strong className="font-bold">{lang.language}:</strong> {lang.level}
                </p>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
