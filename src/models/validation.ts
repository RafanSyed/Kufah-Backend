import StudentModel from "./students/models";
import ClassModel from "./classes/models";
import AttendanceModel from "./attendance/models";

/**
 * --- EXISTENCE VALIDATIONS ---
 */

/** Check if a student exists by ID */
export const validateStudent = async (id: number): Promise<boolean> => {
  const student = await StudentModel.findByPk(id);
  if (!student) throw new Error(`Student with ID ${id} not found`);
  return true;
};


/** Check if a class exists by ID */
export const validateClass = async (id: number): Promise<boolean> => {
  const classRow = await ClassModel.findByPk(id);
  if (!classRow) throw new Error(`Class with ID ${id} not found`);
  return true;
};

/** Check if an attendance record exists by ID */
export const validateAttendance = async (id: number): Promise<boolean> => {
  const attendance = await AttendanceModel.findByPk(id);
  if (!attendance) throw new Error(`Attendance record with ID ${id} not found`);
  return true;
};

/**
 * Optional: validate a student is enrolled in a class
 */
export const validateStudentInClass = async (studentId: number, classId: number): Promise<boolean> => {
  // Ensure attribute names match your model
  const attendance = await AttendanceModel.findOne({
    where: { student_id: studentId, class_id: classId }, // <-- match model field names
  });

  if (!attendance) throw new Error(`Student ${studentId} is not enrolled in class ${classId}`);
  return true;
};

/**
 * --- FIELD VALIDATIONS ---
 */

/** Validate email format */
export const validateStudentEmail = async (email: string): Promise<boolean> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error(`Invalid email format: ${email}`);
  
  // Optional: check uniqueness
  const existing = await StudentModel.findOne({ where: { email } });
  if (existing) throw new Error(`Email already in use: ${email}`);
  
  return true;
};

/** Validate phone number format (basic) */
export const validateStudentPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{7,15}$/; // allows +country code and 7-15 digits
  if (!phoneRegex.test(phone)) throw new Error(`Invalid phone number: ${phone}`);
  return true;
};


/**
 * Validates that the email is properly formatted and not already used
 * by any existing teacher or student.
 */
export const validateEmail = async (email: string): Promise<boolean> => {
  // Simple email regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  // Check if email exists in Students
  const studentExists = await StudentModel.findOne({ where: { email } });
  if (studentExists) {
    throw new Error(`Email already exists for a student: ${email}`);
  }

  return true;
};
