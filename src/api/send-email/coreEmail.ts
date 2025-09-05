import { Router } from "express";
import emailRoutes from "./routes/routes";

const router = Router();

// Mount the email routes as-is (no extra prefix)
router.use("/", emailRoutes);

export default router;
