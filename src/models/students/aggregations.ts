// models/students/aggregations.ts
import { Student } from "./models";

export const populateStudentClass = (data: any): Student => {
  return new Student(data.id, data.firstName, data.lastName, data.email, data.phone);
};
