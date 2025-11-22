// models/questions/aggregations.ts
import { Question } from "./models";

export const populateQuestion = (q: any): Question => {
  return new Question(
    q.id,
    q.question,
    q.answer,
    q.isPublic,
    q.classId,
    q.studentId,
    q.published
  );
};