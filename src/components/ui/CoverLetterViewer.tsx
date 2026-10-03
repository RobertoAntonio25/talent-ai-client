import { useMemo, useState } from "react";
import {
  Copy,
  CheckCheck,
  Sparkles,
  Building2,
  UserCheck,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CoverLetterPdfDocument from "../../pdf/CoverLetterPdfDocument";
import { buildLetterAtsDoc, DOC_TITLES, type DocLang } from "../../pdf/buildAtsDoc";
import type { JobApplication } from "../../types/kanban";
import type { CoverLetterOutput } from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";

interface CoverLetterViewerProps {
  job: JobApplication;
  coverLetterData?: CoverLetterOutput | null;
  isLoading?: boolean;
  onRegenerate?: () => void;
  // Rol actual del usuario (reactivo: viene del CV y cambia al editarlo).
  // Sustituye al antiguo hardcode "Full-Stack Developer | DevOps Engineer".
  targetRole?: string | null;
  // Idioma del documento (detectado de la oferta): todas las etiquetas lo siguen.
  language?: DocLang;
}

export default function CoverLetterViewer({
  job,
  coverLetterData = null,
  isLoading = false,
  onRegenerate,
  targetRole = null,
  language = "es",
}: CoverLetterViewerProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const t = DOC_TITLES[language];

  const identityName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Tu nombre";
  // Rol reactivo: el del CV actual (cambia al editarlo). Se sanean los
  // placeholders del estado vacío para no pintarlos en el documento.
  const rawRole = (targetRole ?? "").trim();
  const roleLine =
    rawRole && !rawRole.startsWith("[") && rawRole !== "Sin CV cargado"
      ? rawRole
      : "Candidato";
  const identityLine = [user?.location, user?.email]
    .map((value) => value?.trim() ?? "")
    .filter((value) => value.length > 0)
    .join(" • ");

  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject =
    coverLetterData?.emailSubject ??
    `Candidatura para la vacante de ${job.position}`;
  // Defensa en profundidad: las cartas guardadas antes del fix del parser
  // traen "\n" literales. Se normalizan al renderizar (las nuevas ya llegan
  // limpias del back) y pre-wrap conserva los saltos simples dentro del párrafo.
  const rawLetter = coverLetterData
    ? coverLetterData.letter.replace(/\\n/g, "\n")
    : null;
  const bodyParagraphs = rawLetter
    ? rawLetter
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    : null;

  const skillsList =
    job.tags && job.tags.length > 0
      ? job.tags.slice(0, 4).join(", ")
      : "las tecnologías de la oferta";

  const coverLetterText = coverLetterData?.emailBody
    ? `${subject}\n\n${coverLetterData.emailBody}`
    : [
        identityName,
        identityLine,
        "",
        currentDate,
        "",
        `A la atención del Equipo de Selección de ${job.company}`,
        `Asunto: ${subject}`,
        "",
        `Estimado equipo de ${job.company},`,
        "",
        `Les escribo para presentar mi candidatura a la posición de ${job.position}. Mi experiencia en desarrollo de software moderno y metodologías ágiles se alinea con los requerimientos técnicos del equipo.`,
        "",
        `Como ${roleLine}, he implementado soluciones SaaS escalables y pipelines de CI/CD. Cuento con dominio en ${skillsList}, diseño de arquitecturas eficientes y pruebas automatizadas.`,
        "",
        `En mis proyectos recientes lideré plataformas SaaS con persistencia en PostgreSQL y Supabase, logrando optimizaciones en tiempos de respuesta y adopción. Mi experiencia con Scrum y Kanban me permite aportar valor inmediato.`,
        "",
        `Agradezco su consideración y quedo a su disposición para una entrevista.`,
        "",
        `Atentamente,`,
        identityName,
      ]
        .join("\n")
        .replace(/\n{3,}/g, "\n\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar la carta:", err);
    }
  };

  // Sin carta de la IA no hay documento: el botón ni se renderiza.
  const letterBodyText = coverLetterData?.letter ?? "";

  const letterDoc = useMemo(
    () =>
      buildLetterAtsDoc({
        identityName,
        roleLine,
        identityLine,
        date: currentDate,
        company: job.company,
        subject,
        letter: letterBodyText,
        lang: language,
      }),
    [identityName, roleLine, identityLine, currentDate, job.company, subject, letterBodyText, language],
  );

  const cleanLetterName = identityName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            Para {job.company}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" /> Carta Lista
          </span>
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <span>{isLoading ? "Generando…" : "↻ Regenerar con IA"}</span>
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-aplika-lima-500 hover:bg-aplika-lima-400 text-aplika-night-950 text-xs font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-aplika-lima-500/20 cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCheck className="w-4 h-4 text-white" />
              <span>¡Copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-aplika-night-900" />
              <span>
                {coverLetterData?.emailBody
                  ? "Copiar Asunto y Cuerpo para Email"
                  : "Copiar Carta"}
              </span>
            </>
          )}
        </button>
        {coverLetterData && (
          <PDFDownloadLink
            document={<CoverLetterPdfDocument doc={letterDoc} />}
            fileName={`${cleanLetterName}_Carta_Presentacion.pdf`}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            {({ loading }) => <span>{loading ? "Generando PDF…" : "Descargar PDF (A4)"}</span>}
          </PDFDownloadLink>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-purple-400">Generando carta con IA…</p>
      )}

      <div
        className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 font-sans text-xs sm:text-sm leading-relaxed max-w-[794px] mx-auto w-full select-text"
      >
        <div className="border-b border-slate-200 pb-3 mb-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {identityName}
          </h2>
          <p className="text-xs font-semibold text-aplika-lima-700">
            {roleLine}
          </p>
          {identityLine && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {identityLine}
            </p>
          )}
        </div>

        <div className="space-y-1 mb-4 text-xs text-slate-600">
          <p className="font-medium text-slate-500">{currentDate}</p>
          <p className="font-bold text-slate-800">
            {t.team} • {job.company}
          </p>
          <p className="text-slate-500">
            {t.subject}: <strong className="text-slate-800">{subject}</strong>
          </p>
        </div>

        <div className="space-y-3 text-justify text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
          {bodyParagraphs ? (
            bodyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <>
              <p>
                Estimado equipo de selección de{" "}
                <strong className="text-slate-900">{job.company}</strong>,
              </p>
              <p>
                Les escribo para presentar mi candidatura al puesto de{" "}
                <strong className="text-slate-900">{job.position}</strong>.
              </p>
              <p>
                Como{" "}
                <span className="font-semibold text-slate-900">{roleLine}</span>
                , he implementado plataformas SaaS escalables con dominio en{" "}
                <span className="font-semibold text-slate-900">
                  {skillsList}
                </span>
                , integrando diseño de arquitecturas eficientes, tests
                automatizados y despliegues CI/CD.
              </p>
              <p>
                En proyectos recientes lideré plataformas interactivas con
                PostgreSQL y Supabase con notables optimizaciones. Mi
                experiencia con metodologías ágiles garantiza una integración
                inmediata.
              </p>
              <p>
                Agradezco su consideración y quedo a su disposición para
                profundizar en una entrevista.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{t.closing}</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {identityName}
            </p>
            <p className="text-xs text-slate-500">{roleLine}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <UserCheck className="w-4 h-4 text-aplika-lima-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
