import { Router } from "express";
import studentRoutes from "./routes/routes";

const router = Router();

// Mount the student routes as-is (no extra prefix)
router.use("/", studentRoutes);

export default router;
