import TeacherClassesModel from "./models";
import { populateTeacherClasses, TeacherClass } from "./aggregations";
import { TeacherClassRequest, BulkTeacherClassRequest } from "./types";
import { populateTeacherClass } from "../teachers/aggregations";

export const addTeacherToClass = async (
  data: TeacherClassRequest
): Promise<TeacherClass> => {
  const response = await TeacherClassesModel.create(data as any);
  return populateTeacherClasses(response.get({ plain: true }));
};

export const addTeachersToClass = async (
  data: BulkTeacherClassRequest
): Promise<TeacherClass[]> => {
  const { teacherIds, classId } = data;

  // Create a record for each teacher
  const createdRecords = await Promise.all(
    teacherIds.map((teacherId) =>
      TeacherClassesModel.create({
        teacherId,
        classId,
      } as any)
    )
  );

  // Return populated plain objects
  return createdRecords.map((record) =>
    populateTeacherClasses(record.get({ plain: true }))
  );
};

export const removeTeacherFromClass = async (id: number): Promise<void> => {
  const tc: TeacherClassesModel | null = await TeacherClassesModel.findByPk(id);
  if (!tc) throw new Error(`TeacherClass record with id ${id} not found`);
  await tc.destroy();
};

export const fetchTeachersInClass = async (
  classId: number
): Promise<TeacherClass[]> => {
  const records: TeacherClassesModel[] = await TeacherClassesModel.findAll({
    where: { classId },
  });
  return records.map((r) => populateTeacherClasses(r.get({ plain: true })));
};

export const fetchClassesForTeacher = async (
  teacherId: number
): Promise<TeacherClass[]> => {
  const records: TeacherClassesModel[] = await TeacherClassesModel.findAll({
    where: { teacherId },
  });
  return records.map((r) => populateTeacherClasses(r.get({ plain: true })));
};

export const addClassesToTeacher = async (
  teacherId: number,
  classIds: number[]
): Promise<TeacherClass[]> => {
  // Create a record for each class
  const createdRecords = await Promise.all(
    classIds.map((classId) =>
      TeacherClassesModel.create({
        teacherId,
        classId,
      } as any)
    )
  );

  // Return populated plain objects
  return createdRecords.map((record) =>
    populateTeacherClasses(record.get({ plain: true }))
  );
};

export const updateClassesForTeacher = async (
  teacherId: number,
  classIds: number[]
): Promise<TeacherClass[]> => {
  // 1. Delete all current class assignments for this teacher
  await TeacherClassesModel.destroy({ where: { teacherId } });

  // 2. Create new assignments
  const createdRecords = await Promise.all(
    classIds.map((classId) =>
      TeacherClassesModel.create({
        teacherId,
        classId,
      } as any)
    )
  );

  // 3. Return populated plain objects
  return createdRecords.map((record) =>
    populateTeacherClasses(record.get({ plain: true }))
  );
};