import StudentClassModel from "./models";
import { populateStudentClass, StudentClass } from "./aggregations";
import { StudentClassRequest, BulkStudentClassRequest } from "./types";
import { fetchAttendanceByStudent, updateAttendance } from "../attendance/functions";

export const addStudentToClass = async (
  data: StudentClassRequest
): Promise<StudentClass> => {
  const response = await StudentClassModel.create(data as any   );
  return populateStudentClass(response.get({ plain: true }));
};

export const addStudentsToClass = async (
  data: BulkStudentClassRequest
): Promise<StudentClass[]> => {
  const { studentIds, classId } = data;

  // Create a record for each student
  const createdRecords = await Promise.all(
    studentIds.map(studentId =>
      StudentClassModel.create({
        studentId,
        classId,
      } as any)
    )
  );

  // Return populated plain objects
  return createdRecords.map(record =>
    populateStudentClass(record.get({ plain: true }))
  );
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

export const addClassesToStudent = async (
  studentId: number,
  classIds: number[]
): Promise<StudentClass[]> => {
  // Create a record for each class
  const createdRecords = await Promise.all(
    classIds.map(classId =>
      StudentClassModel.create({
        studentId,
        classId,
      } as any)
    )
  );

  // Return populated plain objects
  return createdRecords.map(record =>
    populateStudentClass(record.get({ plain: true }))
  );
};

export const updateClassesForStudent = async (
  studentId: number,
  classIds: number[]
): Promise<StudentClass[]> => {
  // 1. Delete all current class assignments for this student
  await StudentClassModel.destroy({ where: { studentId } });

  // 2. Create new assignments
  const createdRecords = await Promise.all(
    classIds.map((classId) =>
      StudentClassModel.create({
        studentId,
        classId,
      } as any)
    )
  );

  // 3. Return populated plain objects
  return createdRecords.map((record) =>
    populateStudentClass(record.get({ plain: true }))
  );
};


const OLD_FIQH_CLASS_ID = 24;
const NEW_FIQH_CLASS_ID = 33;

export const migrateFiqhStudent = async (studentId: number) => {
  // 1. Check current classes
  const classes = await fetchClassesForStudent(studentId);

  const isInOld = classes.some(c => c.classId === OLD_FIQH_CLASS_ID);
  const alreadyInNew = classes.some(c => c.classId === NEW_FIQH_CLASS_ID);

  if (!isInOld) {
    throw new Error("Student is not in the original Fiqh class");
  }

  if (alreadyInNew) {
    return { message: "Already migrated" };
  }

  // 2. Add to new class FIRST
  await addStudentToClass({
    studentId,
    classId: NEW_FIQH_CLASS_ID,
  });

  // 3. Fetch attendance
  const attendance = await fetchAttendanceByStudent(studentId);

  const fiqhAttendance = attendance.filter(
    (a) => a.class_id === OLD_FIQH_CLASS_ID // ✅ FIXED
  );

  // 4. Update attendance
  await Promise.all(
    fiqhAttendance.map((record) =>
      updateAttendance(record.id, {
        class_id: NEW_FIQH_CLASS_ID, // ✅ FIXED
      })
    )
  );

  // 5. Remove from old class
  const oldClassRecord = classes.find(
    (c) => c.classId === OLD_FIQH_CLASS_ID
  );

  if (!oldClassRecord) {
    throw new Error("Old class record not found");
  }

  await removeStudentFromClass(oldClassRecord.id);

  return {
    message: "Migration successful",
    movedAttendanceCount: fiqhAttendance.length, // 🔥 useful debug info
  };
};

const OLD_TAJWEED_CLASS_ID = 28;
const NEW_TAJWEED_CLASS_ID = 34;

export const migrateTajweedStudent = async (studentId: number) => {
  const classes = await fetchClassesForStudent(studentId);

  const isInOld = classes.some(c => c.classId === OLD_TAJWEED_CLASS_ID);
  const alreadyInNew = classes.some(c => c.classId === NEW_TAJWEED_CLASS_ID);

  if (!isInOld) {
    throw new Error("Student is not in the original Tajweed class");
  }

  if (alreadyInNew) {
    return { message: "Already migrated" };
  }

  // 1. Add to new class
  await addStudentToClass({
    studentId,
    classId: NEW_TAJWEED_CLASS_ID,
  });

  // 2. Fetch attendance
  const attendance = await fetchAttendanceByStudent(studentId);

  const tajweedAttendance = attendance.filter(
    (a) => a.class_id === OLD_TAJWEED_CLASS_ID
  );

  // 3. Move attendance
  await Promise.all(
    tajweedAttendance.map((record) =>
      updateAttendance(record.id, {
        class_id: NEW_TAJWEED_CLASS_ID,
      })
    )
  );

  // 4. Remove from old class
  const oldClassRecord = classes.find(
    (c) => c.classId === OLD_TAJWEED_CLASS_ID
  );

  if (!oldClassRecord) {
    throw new Error("Old class record not found");
  }

  await removeStudentFromClass(oldClassRecord.id);

  return {
    message: "Migration successful",
    movedAttendanceCount: tajweedAttendance.length,
  };
};
