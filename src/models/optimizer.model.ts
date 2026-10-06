export interface OptimizedExperience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  bullets?: string[];
}
export interface OptimizedHeader {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}
export interface OptimizedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  technologiesTools: string[];
  practices: string[];
}
export interface OptimizedProject {
  name: string;
  technologies: string[];
  repoUrl?: string;
  description?: string;
}
export interface OptimizedEducation {
  degree: string;
  institution: string;
  graduationYear?: number;
  details?: string;
}
export interface OptimizedLanguage {
  language: string;
  level: string;
}
export interface OptimizedCv {
  summary: string;
  experiences: OptimizedExperience[];
  skillsMatched: string[];
  keywordsInjected: string[];
  keywordsSkipped: string[];
  header?: OptimizedHeader;
  skills?: OptimizedSkills;
  projects?: OptimizedProject[];
  education?: OptimizedEducation[];
  languages?: OptimizedLanguage[];
  language?: "es" | "en";
  coverage?: { injected: number; verified: number };
  generatedAt?: string;
  schemaVersion?: number;
}
export interface CoverLetterOutput {
  letter: string;
  emailSubject: string;
  emailBody: string;
  language: "es" | "en";
}
export type CvPatch = Partial<OptimizedCv>;
export interface OptimizerCacheEntry {
  cv?: OptimizedCv;
  letter?: CoverLetterOutput;
}
