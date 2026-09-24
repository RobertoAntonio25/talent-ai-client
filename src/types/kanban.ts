export type ColumnStatus = "por_revisar" | "aplicado" | "entrevista" | "oferta";

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ColumnStatus;
  date: string;
  location?: string;
  salary?: string;
  matchScore?: number;
  tags?: string[];
  notes?: string;
}
