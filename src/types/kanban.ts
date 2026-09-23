export type ColumnStatus = "por_revisar" | "aplicado" | "entrevista" | "oferta";

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ColumnStatus;
  date: string;
}
