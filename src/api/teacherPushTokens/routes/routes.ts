// src/backend/api/teacherPushTokens/routes.ts
import { Router, Request, Response } from "express";
import {
  registerTeacherPushToken,
  fetchActiveTokensForTeacher,
  deactivateTeacherPushToken,
} from "../../../models/teacherPushTokens/functions";
import { teacherPushTokenRequest } from "../../../models/teacherPushTokens/types";

const router = Router();

// POST /api/teacher-push-tokens/register
router.post("/register", async (req: Request<{}, {}, Partial<teacherPushTokenRequest>>, res: Response) => {
  try {
    const { teacher_id, push_token, platform } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ message: "teacher_id is required" });
    }
    if (!push_token) {
      return res.status(400).json({ message: "push_token is required" });
    }

    const token = await registerTeacherPushToken({
      teacher_id: Number(teacher_id),
      push_token: String(push_token),
      platform: platform ?? null,
    });

    res.status(201).json(token);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// GET /api/teacher-push-tokens/teacher/:teacherId
router.get("/teacher/:teacherId", async (req: Request, res: Response) => {
  try {
    const teacherId = Number(req.params.teacherId);
    if (!Number.isFinite(teacherId)) {
      return res.status(400).json({ message: "teacherId must be a number" });
    }

    const tokens = await fetchActiveTokensForTeacher(teacherId);
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// PATCH /api/teacher-push-tokens/deactivate
router.patch("/deactivate", async (req: Request, res: Response) => {
  try {
    const { push_token } = req.body;
    if (!push_token) {
      return res.status(400).json({ message: "push_token is required" });
    }

    await deactivateTeacherPushToken(String(push_token));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;