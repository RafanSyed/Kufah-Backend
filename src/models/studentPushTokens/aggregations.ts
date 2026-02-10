import { StudentPushToken } from "./models";

export function toPopulateStudentPushToken(data: any): StudentPushToken {
  return new StudentPushToken(
    data.id,
    data.student_id,
    data.push_token,
    data.platform,
    data.is_active,
    data.created_at,
    data.updated_at
  );
}