// src/backend/api/studentClasses/coreStudentClasses.ts
import { Router } from "express";
import noSchoolRoutes from "./routes/routes";

const router = Router();

// Mount all noSchool endpoints under /noSchool
router.use("/", noSchoolRoutes);

export default router;
