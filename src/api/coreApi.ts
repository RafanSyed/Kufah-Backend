import { Router } from "express";
import coreStudents from "./students/coreStudents";
import coreClasses from "./classes/coreClasses";
import coreStudentClasses from "./studentClasses/coreStudentClasses";
import coreAttendance from "./attendance/coreAttendance";
import coreEmail from "./send-email/coreEmail";
import coreNoSchool from "./noSchool/coreNoSchool";

const router = Router();

// Each core router is mounted once, at its base path
router.use("/students", coreStudents);
router.use("/classes", coreClasses);
router.use("/student-classes", coreStudentClasses);
router.use("/attendance", coreAttendance);
router.use("/send-email", coreEmail);
router.use("/noSchool", coreNoSchool);



export default router;
