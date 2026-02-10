import { Router } from "express";
import studentPushTokensRoutes from "./routes/routes";

const router = Router();

// Mount all studentPushTokens endpoints under /student-push-tokens
router.use("/", studentPushTokensRoutes);

export default router;