// src/backend/api/classes/coreClasses.ts
import { Router } from "express";
import classesRoutes from "./routes/routes";

const router = Router();

// Mount all class endpoints under /classes
router.use("/", classesRoutes);

export default router;
