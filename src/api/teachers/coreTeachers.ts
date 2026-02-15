import { Router } from "express";
import teacherRoutes from "./routes/routes";

const router = Router();

// Mount the teacher routes as-is (no extra prefix)
router.use("/", teacherRoutes);

export default router;
