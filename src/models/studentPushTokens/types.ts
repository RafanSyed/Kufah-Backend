export interface ClassOccurrenceRequest {
  id: number;
  class_id: number;
  date: string; // DATEONLY typically comes as "YYYY-MM-DD"
  starts_at: Date;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}