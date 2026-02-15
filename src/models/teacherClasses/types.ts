export interface TeacherClassRequest {
  classId: number;
  teacherId: number;
}

export interface BulkTeacherClassRequest {
  teacherIds: number[]; // array of teacher IDs
  classId: number;      // single class ID
}