// src/backend/api/pushTokens/routes/routes.ts
import { Router, Request, Response } from "express";
import {
  createStudentPushToken,
  fetchStudentPushTokenById,
  updateStudentPushToken,
  deleteStudentPushToken,
  fetchAllStudentPushTokens,
  registerPushToken,
  fetchActiveTokensForStudent,
  deactivatePushToken,
} from "../../../models/studentPushTokens/functions";

const router = Router();

/**
 * Routes:
 * GET    /api/push-tokens
 * POST   /api/push-tokens
 * POST   /api/push-tokens/register
 * GET    /api/push-tokens/student/:studentId
 * PATCH  /api/push-tokens/deactivate
 * GET    /api/push-tokens/:id
 * PUT    /api/push-tokens/:id
 * DELETE /api/push-tokens/:id
 */

// ------------------- GET all push tokens (admin/debug) -------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchAllStudentPushTokens();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- POST create push token (basic) -------------------
router.post("/", async (req: Request, res: Response) => {
  try {
    const { student_id, push_token, platform, is_active } = req.body;

    if (!student_id) return res.status(400).json({ message: "student_id is required" });
    if (!push_token) return res.status(400).json({ message: "push_token is required" });

    const created = await createStudentPushToken({
      student_id: Number(student_id),
      push_token: String(push_token),
      platform: platform ?? null,
      is_active: is_active ?? true,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// ------------------- POST register token (recommended; upsert behavior) -------------------
// Expo app should call this:
// POST /api/push-tokens/register
// body: { student_id, push_token, platform }
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { student_id, push_token, platform } = req.body;

    if (!student_id) return res.status(400).json({ message: "student_id is required" });
    if (!push_token) return res.status(400).json({ message: "push_token is required" });

    const row = await registerPushToken({
      student_id: Number(student_id),
      push_token: String(push_token),
      platform: platform ?? null,
      is_active: true,
    });

    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// ------------------- GET active tokens for a student (worker uses this) -------------------
// GET /api/push-tokens/student/123
router.get("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    if (!Number.isFinite(studentId)) {
      return res.status(400).json({ message: "studentId must be a number" });
    }

    const rows = await fetchActiveTokensForStudent(studentId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- PATCH deactivate token -------------------
// PATCH /api/push-tokens/deactivate
// body: { push_token }
router.patch("/deactivate", async (req: Request, res: Response) => {
  try {
    const { push_token } = req.body;
    if (!push_token) return res.status(400).json({ message: "push_token is required" });

    await deactivatePushToken(String(push_token));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET by id -------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "id must be a number" });

    const row = await fetchStudentPushTokenById(id);
    res.json(row);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- PUT update by id -------------------
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "id must be a number" });

    const updates = req.body ?? {};
    const updated = await updateStudentPushToken(id, updates);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- DELETE by id -------------------
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "id must be a number" });

    await deleteStudentPushToken(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

export default router;
