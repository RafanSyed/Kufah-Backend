export interface AttendanceRequest {
  date: Date;
  status: "Absent" | "In Person" | "Online" | "Recording";
  student_id: number;
  class_id: number;
  token?: string;
  token_expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  email_link?: string;
  email_sent?: boolean;   // 🆕 optional, defaults to false
}
