// src/backend/api/classes/coreClasses.ts
import { Router } from "express";
import eventsRouter from "./routes/routes";

const router = Router();

// Mount all class endpoints under /classes
router.use("/", eventsRouter);

export default router;
