import type { OptimizedCv } from "../models/optimizer.model";
import type { GeneratedCV } from "../types/cv";
import type { CoverLetterOutput } from "../services/aiService";
import type { AtsCvDoc, AtsSkillGroup, DocLang } from "./atsDoc";
import { DOC_TITLES } from "./atsDoc";

export type { DocLang };
export { DOC_TITLES };

export interface AtsContact {
  displayName: string;
  headline: string;
  contactLine: string;
}

// Detección determinista del idioma de la oferta por stopwords. Sin llamada
// a IA: los títulos del documento siguen al idioma detectado (nada de mezcla).
export function detectOfferLanguage(text: string): DocLang {
  const folded = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z\s]/g, " ");
  const words = new Set(folded.split(/\s+/).filter(Boolean));
  const es = ["el", "la", "los", "las", "de", "del", "una", "para", "con", "buscamos", "oferta", "experiencia", "puesto", "empresa", "jornada", "salario", "requisitos"].filter((w) =>
    words.has(w),
  ).length;
  const en = ["the", "and", "for", "with", "you", "will", "our", "role", "skills", "experience", "requirements", "benefits", "about", "join"].filter((w) =>
    words.has(w),
  ).length;
  return en > es ? "en" : "es";
}

export function groupsFromSkills(
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    technologiesTools: string[];
    practices: string[];
  },
  lang: DocLang = "es",
): AtsSkillGroup[] {
  const labels = DOC_TITLES[lang].skillGroups;
  const pairs: Array<[keyof typeof skills, string]> = [
    ["languages", labels.languages],
    ["frameworks", labels.frameworks],
    ["databases", labels.databases],
    ["technologiesTools", labels.technologiesTools],
    ["practices", labels.practices],
  ];
  return pairs
    .map(([key, label]) => ({ label, items: skills[key] ?? [] }))
    .filter((g) => g.items.length > 0);
}

function splitBullets(exp: {
  bullets?: string[];
  description?: string;
}): string[] {
  const raw =
    exp.bullets && exp.bullets.length
      ? exp.bullets
      : exp.description
        ? [exp.description]
        : [];
  let out: string[] = [];
  for (const item of raw) {
    for (const part of String(item).split("•")) {
      const c = part
        .trim()
        .replace(/^[-*\d]+[.)\s]+/, "")
        .trim();
      if (c) out.push(c);
    }
  }
  if (out.length <= 1 && out[0] && out[0].length > 300) {
    const parts = out[0]
      .split(/(?<=[.!?])\s+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (parts.length >= 2) out = parts;
  }
  return out.slice(0, 4);
}

// CV optimizado por IA → documento.
export function buildOptimizedAtsDoc(
  optimized: OptimizedCv,
  contact: AtsContact,
  fallbackSkills: { label: string; items: string[] }[],
  lang: DocLang = "es",
): AtsCvDoc {
  const fromIa = groupsFromSkills(
    optimized.skills ?? {
      languages: [],
      frameworks: [],
      databases: [],
      technologiesTools: [],
      practices: [],
    },
    lang,
  );
  return {
    lang,
    displayName: contact.displayName,
    headline: contact.headline,
    contactLine: contact.contactLine,
    summary: optimized.summary,
    skills: fromIa.length > 0 ? fromIa : fallbackSkills,
    experience: optimized.experiences.map((exp) => ({
      company: exp.company,
      dates: [exp.startDate, exp.endDate].filter(Boolean).join(" – "),
      roleLine: `${exp.role}${exp.location ? ` · ${exp.location}` : ""}`,
      bullets: splitBullets(exp),
    })),
    projects: (optimized.projects ?? []).map((p) => ({
      name: p.name,
      repoUrl: p.repoUrl,
      description: [
        p.description ?? "",
        p.technologies.length > 0 && !p.description
          ? `Built with ${p.technologies.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    })),
    education: (optimized.education ?? []).map((e) => ({
      institution: e.institution,
      period: e.graduationYear ? String(e.graduationYear) : "",
      degree: e.degree,
      details: e.details,
    })),
    languagesLine: (optimized.languages ?? [])
      .map((l) => `${l.language}: ${l.level}`)
      .join(" · "),
  };
}

// CV clásico (sin optimizar) → documento.
export function buildClassicAtsDoc(
  cv: GeneratedCV,
  contact: AtsContact,
  lang: DocLang = "es",
): AtsCvDoc {
  const cat = cv.skillsCategorized;
  return {
    lang,
    displayName: contact.displayName,
    headline: contact.headline,
    contactLine: contact.contactLine,
    summary: cv.summary ?? "",
    skills: cat
      ? groupsFromSkills({ ...cat, technologiesTools: cat.tools }, lang)
      : (cv.skills ?? []).length > 0
        ? [{ label: "Habilidades", items: cv.skills }]
        : [],
    experience: (cv.experience ?? []).map((exp) => ({
      company: exp.company,
      dates: exp.period,
      roleLine: exp.role,
      bullets: exp.achievements,
    })),
    projects: (cv.projects ?? []).map((p) => ({
      name: p.name,
      repoUrl: p.repoUrl,
      description:
        p.technologies.length > 0
          ? `Built with ${p.technologies.join(", ")}.`
          : "",
    })),
    education: (cv.education ?? []).map((e) => ({
      institution: e.institution,
      period: e.period,
      degree: e.degree,
      details: e.details,
    })),
    languagesLine: (cv.languages ?? [])
      .map((l) => `${l.language}: ${l.level}`)
      .join(" · "),
  };
}

export interface AtsLetterDoc {
  lang: DocLang;
  identityName: string;
  roleLine: string;
  identityLine: string;
  date: string;
  company: string;
  subject: string;
  paragraphs: string[];
}

// Carta (solo IA: sin carta no hay documento) → documento.
export function buildLetterAtsDoc(args: {
  identityName: string;
  roleLine: string;
  identityLine: string;
  date: string;
  company: string;
  subject: string;
  letter: string;
  lang?: DocLang;
}): AtsLetterDoc {
  return {
    lang: args.lang ?? "es",
    identityName: args.identityName,
    roleLine: args.roleLine,
    identityLine: args.identityLine,
    date: args.date,
    company: args.company,
    subject: args.subject,
    paragraphs: args.letter
      .replace(/\\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
  };
}

export type { CoverLetterOutput };
