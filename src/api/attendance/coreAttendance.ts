// src/backend/api/attendance/coreAttendance.ts
import { Router } from "express";
import attendanceRoutes from "./routes/routes";

const router = Router();

// Mount all attendance endpoints under /attendance
router.use("/", attendanceRoutes);

export default router;
