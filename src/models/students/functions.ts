import StudentModel, { Student } from "./models";
import { populateStudentClass } from "./aggregations";
import { StudentRequest } from "./types";
import { StudentGoalsUpdate } from "./types";


/**
 * Create a new student
 */
export const createStudent = async (student: StudentRequest): Promise<Student> => {
  const response: StudentModel = await StudentModel.create(student as any);
  return populateStudentClass(response.get({ plain: true }));
};

/**
 * Create multiple students at once
 */
export const createMultipleStudents = async (students: StudentRequest[]): Promise<Student[]> => {
  // Insert all students in one go
  const createdStudents: StudentModel[] = await StudentModel.bulkCreate(
    students as any[],
    { validate: true } // ensures each row respects model validation
  );

  // Return them as your Student type
  return createdStudents.map((s) => populateStudentClass(s.get({ plain: true })));
};

/**
 * Fetch a single student by query (e.g., id or email)
 */
export const fetchStudentByQuery = async (query: Partial<StudentRequest>): Promise<Student> => {
  const student: StudentModel | null = await StudentModel.findOne({ where: query });
  if (!student) throw new Error(`Student not found with query ${JSON.stringify(query)}`);
  return populateStudentClass(student.get({ plain: true }));
};

/**
 * Fetch all students optionally filtered by query
 */
export const fetchAllStudents = async (query?: Partial<StudentRequest>): Promise<Student[]> => {
  // Only include 'where' if query exists
  const findOptions = query ? { where: query } : {};
  
  const students: StudentModel[] = await StudentModel.findAll(findOptions);
  return students.map((s) => populateStudentClass(s.get({ plain: true })));
};

/**
 * Update a student by ID
 */
export const updateStudent = async (id: number, updates: Partial<StudentRequest>): Promise<Student> => {
  const student: StudentModel | null = await StudentModel.findByPk(id);
  if (!student) throw new Error(`Student with ID ${id} not found`);

  await student.update(updates);
  return populateStudentClass(student.get({ plain: true }));
};

/**
 * Delete a student by ID
 */
export const deleteStudent = async (id: number): Promise<void> => {
  const student: StudentModel | null = await StudentModel.findByPk(id);
  if (!student) throw new Error(`Student with ID ${id} not found`);

  await student.destroy();
};

/**
 * Fetch just the student's daily ibadah goals
 */
export const fetchStudentIbadahGoals = async (
  id: number
): Promise<{ salawat_goal_daily: number; adhkar_goal_daily: number; istighfar_goal_daily: number }> => {
  const student: StudentModel | null = await StudentModel.findByPk(id, {
    attributes: ["id", "salawat_goal_daily", "adhkar_goal_daily", "istighfar_goal_daily"],
  });

  if (!student) throw new Error(`Student with id ${id} not found`);

  const plain: any = student.get({ plain: true });
  return {
    salawat_goal_daily: Number(plain.salawat_goal_daily ?? 0),
    adhkar_goal_daily: Number(plain.adhkar_goal_daily ?? 0),
    istighfar_goal_daily: Number(plain.istighfar_goal_daily ?? 0),
  };
};

/**
 * Update the student's daily ibadah goals (teacher/admin action)
 * - Only updates fields provided
 * - Clamps to >= 0
 */
export const updateStudentIbadahGoals = async (
  id: number,
  updates: StudentGoalsUpdate
): Promise<Student> => {
  const student: StudentModel | null = await StudentModel.findByPk(id);
  if (!student) throw new Error(`Student with id ${id} not found`);

  const patch: any = {};

  const clamp = (n: unknown) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return undefined;
    return Math.max(0, Math.floor(x));
  };

  if (updates.salawat_goal_daily !== undefined) {
    patch.salawat_goal_daily = clamp(updates.salawat_goal_daily);
  }
  if (updates.adhkar_goal_daily !== undefined) {
    patch.adhkar_goal_daily = clamp(updates.adhkar_goal_daily);
  }
  if (updates.istighfar_goal_daily !== undefined) {
    patch.istighfar_goal_daily = clamp(updates.istighfar_goal_daily);
  }

  await student.update(patch);
  return populateStudentClass(student.get({ plain: true }));
};

/**
 * Convenience: set all 3 goals at once (overwrite)
 */
export const setStudentIbadahGoals = async (
  id: number,
  goals: { salawat_goal_daily: number; adhkar_goal_daily: number; istighfar_goal_daily: number }
): Promise<Student> => {
  return updateStudentIbadahGoals(id, goals);
};
