// models/students/aggregations.ts
import { Student } from "./models";

export const populateStudentClass = (data: any): Student => {
  return new Student(data.id, data.firstName, data.lastName, data.email, data.phone, data.salawat_goal_daily, data.adhkar_goal_daily, data.istighfar_goal_daily);
};
