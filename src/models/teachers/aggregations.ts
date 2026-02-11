import { Teacher } from "./models";

export const populateTeacherClass = (data: any): Teacher => {
  return new Teacher(data.id, data.firstName, data.lastName, data.email);
};