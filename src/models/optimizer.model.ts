// src/models/optimizer.model.ts
// Tipos frontend-only del Optimizador ATS (contrato API.md §6).
// V1 actual + campos v2 opcionales para tolerar evolución sin romper.

export interface OptimizedExperience {
  role: string;
  company: string;
  description: string;
}

export interface OptimizedHeader {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface KeywordCoverage {
  injected: string[];
  verified: string[];
}

export interface OptimizedCv {
  summary: string;
  experiences: OptimizedExperience[];
  skillsMatched: string[];
  keywordsInjected: string[];
  header?: OptimizedHeader;
  headline?: string;
  education?: Array<{ degree?: string; institution?: string }>;
  languages?: Array<{ language?: string; level?: string }>;
  keywordCoverage?: KeywordCoverage;
  generatedAt?: string;
  schemaVersion?: number;
}

export interface CoverLetterOutput {
  letter: string;
  emailSubject: string;
  emailBody: string;
}

export type CvPatch = Partial<OptimizedCv>;

export interface OptimizerCacheEntry {
  cv?: OptimizedCv;
  letter?: CoverLetterOutput;
}
