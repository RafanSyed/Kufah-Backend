export interface StudentClassRequest {
  classId: number;
  studentId: number;
}

export interface BulkStudentClassRequest {
  studentIds: number[]; // array of student IDs
  classId: number;      // single class ID
}