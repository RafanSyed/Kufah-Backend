// src/backend/api/teacherClasses/coreTeacherClasses.ts
import { Router } from "express";
import teacherClassesRoutes from "./routes/routes";

const router = Router();

// Mount all teacherClasses endpoints under /teacher-classes
router.use("/", teacherClassesRoutes);

export default router;
