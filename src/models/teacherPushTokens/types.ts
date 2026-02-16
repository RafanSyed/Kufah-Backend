export interface teacherPushTokenRequest {
  teacher_id: number;
  push_token: string;
  platform?: string | null;
}

export interface TeacherPushToken extends teacherPushTokenRequest {
  id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}