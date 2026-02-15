// src/backend/api/annoucements/coreAnnoucements.ts
import { Router } from "express";
import annoucementRoutes from "./routes/routes";

const router = Router();

// Mount all annoucement endpoints under /annoucements
router.use("/", annoucementRoutes);

export default router;
