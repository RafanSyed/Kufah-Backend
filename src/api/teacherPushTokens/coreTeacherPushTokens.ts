import { Router } from "express";
import teacherPushTokensRoutes from "./routes/routes";

const router = Router();

// Mount all teacherPushTokens endpoints under /teacher-push-tokens
router.use("/", teacherPushTokensRoutes);

export default router;