// associations.ts
import StudentModel from "./students/models";
import ClassModel from "./classes/models";
import StudentClassModel from "./studentClasses/models";
import AttendanceModel from "./attendance/models";

// Students ↔ Classes (many-to-many)
StudentModel.belongsToMany(ClassModel, { through: StudentClassModel, foreignKey: "studentId" });
ClassModel.belongsToMany(StudentModel, { through: StudentClassModel, foreignKey: "classId" });

// Attendance ↔ Students / Classes
AttendanceModel.belongsTo(StudentModel, { foreignKey: "student_id" });
AttendanceModel.belongsTo(ClassModel, { foreignKey: "class_id" });
StudentModel.hasMany(AttendanceModel, { foreignKey: "student_id" });
ClassModel.hasMany(AttendanceModel, { foreignKey: "class_id" });

export {
  StudentModel,
  ClassModel,
  StudentClassModel,
  AttendanceModel
};
