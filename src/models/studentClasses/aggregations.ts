import StudentClassModel from "./models";

export class StudentClass {
  constructor(
    public id: number,
    public classId: number,
    public studentId: number,
  ) {}
}

export const populateStudentClass = (sc: any): StudentClass => {
  return new StudentClass(
    sc.id,
    sc.classId,
    sc.studentId
  );
};
