// Tipos frontend del Optimizador ATS — contrato v2 (API.md §6, formato Dani García).
// Fuente única de verdad: aiService.ts re-exporta desde aquí para evitar
// tipos duplicados entre la capa de red y la capa de presentación.

export interface OptimizedHeader {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

export interface OptimizedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  technologiesTools: string[];
  practices: string[];
}

export interface OptimizedExperience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  period?: string;
  bullets: string[];
  /** Compatibilidad hacia atrás con el contrato v1. */
  description?: string;
}

export interface OptimizedProject {
  name: string;
  repoUrl?: string;
  technologies?: string[];
  description?: string;
}

export interface OptimizedEducation {
  degree: string;
  institution: string;
  period?: string;
  graduationYear?: number;
  details?: string;
}

export interface OptimizedLanguage {
  language: string;
  level: string;
}

export interface OptimizedCv {
  header?: OptimizedHeader;
  summary: string;
  skills: OptimizedSkills;
  experiences: OptimizedExperience[];
  projects?: OptimizedProject[];
  education?: OptimizedEducation[];
  languages?: OptimizedLanguage[];
  // Metadatos internos de auditoría: NO se pintan en el documento ATS.
  skillsMatched: string[];
  keywordsInjected: string[];
  keywordsSkipped: string[];
}

export interface CoverLetterOutput {
  letter: string;
  emailSubject: string;
  emailBody: string;
}

export type OptimizedCvPatch = Partial<OptimizedCv>;
/** Alias retrocompatible: useOptimizer y optimizer.service siguen importando `CvPatch`. */
export type CvPatch = OptimizedCvPatch;

export interface OptimizerCacheEntry {
  cv?: OptimizedCv;
  letter?: CoverLetterOutput;
}
