import TeacherClassModel from "./models";

export class TeacherClass {
  constructor(
    public id: number,
    public classId: number,
    public teacherId: number
  ) {}
}

export const populateTeacherClasses = (tc: any): TeacherClass => {
  return new TeacherClass(tc.id, tc.classId, tc.teacherId);
};