export interface AnnouncementRequest {
  teacher_id: number;
  class_id?: number | null;
  target_side?: string | null;
  title: string;
  message: string;
  created_at?: Date;
  updated_at?: Date;
}