// Modelo intermedio: los visores convierten sus datos a AtsCvDoc y el
// documento PDF solo sabe pintar.
export type DocLang = "es" | "en";

export interface DocTitles {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  languages: string;
  skillGroups: Record<string, string>;
  team: string;
  subject: string;
  closing: string;
}

export const DOC_TITLES: Record<DocLang, DocTitles> = {
  es: {
    summary: "Resumen profesional",
    skills: "Habilidades",
    experience: "Experiencia",
    projects: "Proyectos",
    education: "Educación",
    languages: "Idiomas",
    skillGroups: {
      languages: "Lenguajes",
      frameworks: "Frameworks",
      databases: "Bases de datos",
      technologiesTools: "Tecnologías / Herramientas",
      practices: "Prácticas",
    },
    team: "Equipo de Selección",
    subject: "Asunto",
    closing: "Atentamente,",
  },
  en: {
    summary: "Professional Summary",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
    education: "Education",
    languages: "Languages",
    skillGroups: {
      languages: "Languages",
      frameworks: "Frameworks",
      databases: "Databases",
      technologiesTools: "Technologies / Tools",
      practices: "Practices",
    },
    team: "Hiring Team",
    subject: "Subject",
    closing: "Kind regards,",
  },
};
export interface AtsSkillGroup {
  label: string;
  items: string[];
}

export interface AtsExperience {
  company: string;
  dates: string;
  roleLine: string;
  bullets: string[];
}

export interface AtsProject {
  name: string;
  repoUrl?: string;
  description: string;
}

export interface AtsEducation {
  institution: string;
  period: string;
  degree: string;
  details?: string;
}

export interface AtsCvDoc {
  lang: DocLang;
  displayName: string;
  headline: string;
  contactLine: string;
  summary: string;
  skills: AtsSkillGroup[];
  experience: AtsExperience[];
  projects: AtsProject[];
  education: AtsEducation[];
  languagesLine: string;
}

export function emptyAtsDoc(): AtsCvDoc {
  return {
    lang: "es",
    displayName: "",
    headline: "",
    contactLine: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    languagesLine: "",
  };
}
