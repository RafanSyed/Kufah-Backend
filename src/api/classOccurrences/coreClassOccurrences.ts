// src/backend/api/classes/coreClasses.ts
import { Router } from "express";
import classOccurrencesRoutes from "./routes/route";

const router = Router();

// Mount all class endpoints under /classes
router.use("/", classOccurrencesRoutes);

export default router;
