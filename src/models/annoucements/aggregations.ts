import { Announcement } from "./models";

export const populateAnnouncement = (ann: any): Announcement => {
  return new Announcement(
    ann.id,
    ann.teacher_id,
    ann.class_id,
    ann.target_side,
    ann.title,
    ann.message,
    ann.created_at,
    ann.updated_at
  );
}