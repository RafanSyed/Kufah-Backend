// src/backend/api/classes/coreClasses.ts
import { Router } from "express";
import ibadahRouter from "./routes/routes";

const router = Router();

// Mount all class endpoints under /classes
router.use("/", ibadahRouter);

export default router;
