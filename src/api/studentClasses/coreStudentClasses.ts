// src/backend/api/studentClasses/coreStudentClasses.ts
import { Router } from "express";
import studentClassesRoutes from "./routes/routes";

const router = Router();

// Mount all studentClasses endpoints under /student-classes
router.use("/", studentClassesRoutes);

export default router;
