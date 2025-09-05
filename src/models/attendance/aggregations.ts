import { Attendance } from "./models";

export const populateAttendance = (att: any): Attendance => {
  return new Attendance(
    att.id,
    att.date,
    att.status,
    att.token,
    att.token_expires_at,
    att.created_at,
    att.updated_at,
    att.student_id,
    att.class_id,
    att.email_link
  );
};
export { Attendance };

