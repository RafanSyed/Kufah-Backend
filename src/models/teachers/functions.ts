import TeacherModel, { Teacher } from "./models";
import { populateTeacherClass } from "./aggregations";
import { TeacherRequest } from "./types";

/**
 * Create a new teacher
 */
export const createTeacher = async (teacher: TeacherRequest): Promise<Teacher> => {
  const response: TeacherModel = await TeacherModel.create(teacher as any);
  return populateTeacherClass(response.get({ plain: true }));
};

/**
 * Create multiple teachers at once
 */
export const createMultipleTeachers = async (teachers: TeacherRequest[]): Promise<Teacher[]> => {
  const createdTeachers: TeacherModel[] = await TeacherModel.bulkCreate(teachers as any[], {
    validate: true,
  });

  return createdTeachers.map((t) => populateTeacherClass(t.get({ plain: true })));
};

/**
 * Fetch a single teacher by query (e.g., id or email)
 */
export const fetchTeacherByQuery = async (query: Partial<TeacherRequest>): Promise<Teacher> => {
  const teacher: TeacherModel | null = await TeacherModel.findOne({ where: query });
  if (!teacher) throw new Error(`Teacher not found with query ${JSON.stringify(query)}`);
  return populateTeacherClass(teacher.get({ plain: true }));
};

/**
 * Fetch all teachers optionally filtered by query
 */
export const fetchAllTeachers = async (query?: Partial<TeacherRequest>): Promise<Teacher[]> => {
  const findOptions = query ? { where: query } : {};
  const teachers: TeacherModel[] = await TeacherModel.findAll(findOptions);
  return teachers.map((t) => populateTeacherClass(t.get({ plain: true })));
};

/**
 * Update a teacher by ID
 */
export const updateTeacher = async (id: number, updates: Partial<TeacherRequest>): Promise<Teacher> => {
  const teacher: TeacherModel | null = await TeacherModel.findByPk(id);
  if (!teacher) throw new Error(`Teacher with ID ${id} not found`);

  await teacher.update(updates);
  return populateTeacherClass(teacher.get({ plain: true }));
};

/**
 * Delete a teacher by ID
 */
export const deleteTeacher = async (id: number): Promise<void> => {
  const teacher: TeacherModel | null = await TeacherModel.findByPk(id);
  if (!teacher) throw new Error(`Teacher with ID ${id} not found`);

  await teacher.destroy();
};