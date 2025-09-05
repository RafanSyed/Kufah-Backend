import StudentClassModel from "./models";
import { populateStudentClass, StudentClass } from "./aggregations";
import { StudentClassRequest } from "./types";

export const addStudentToClass = async (
  data: StudentClassRequest
): Promise<StudentClass> => {
  const response = await StudentClassModel.create(data as any   );
  return populateStudentClass(response.get({ plain: true }));
};


export const removeStudentFromClass = async (id: number): Promise<void> => {
  const sc: StudentClassModel | null = await StudentClassModel.findByPk(id);
  if (!sc) throw new Error(`StudentClass record with id ${id} not found`);
  await sc.destroy();
};

export const fetchStudentsInClass = async (
  classId: number
): Promise<StudentClass[]> => {
  const records: StudentClassModel[] = await StudentClassModel.findAll({
    where: { classId },
  });
  return records.map((r) => populateStudentClass(r.get({ plain: true })));
};

export const fetchClassesForStudent = async (
  studentId: number
): Promise<StudentClass[]> => {
  const records: StudentClassModel[] = await StudentClassModel.findAll({
    where: { studentId },
  });
  return records.map((r) => populateStudentClass(r.get({ plain: true })));
};
