import StudentModel, { Student } from "./models";
import { populateStudentClass } from "./aggregations";
import { StudentRequest } from "./types";

/**
 * Create a new student
 */
export const createStudent = async (student: StudentRequest): Promise<Student> => {
  const response: StudentModel = await StudentModel.create(student as any);
  return populateStudentClass(response.get({ plain: true }));
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
