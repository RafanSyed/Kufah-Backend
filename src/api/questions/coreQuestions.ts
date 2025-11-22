import { Router } from "express";
import questionRoutes from "./routes/routes";

const router = Router();

// Mount the email routes as-is (no extra prefix)
router.use("/", questionRoutes);

export default router;
