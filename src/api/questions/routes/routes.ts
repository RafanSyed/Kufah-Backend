// routes/questions.ts
import { Router, Request, Response } from "express";

import {
  createQuestion,
  fetchQuestionById,
  fetchQuestions,
  updateQuestion,
  answerQuestion,
  deleteQuestion,
  setQuestionVisibility,
  setQuestionPublished,          // ✅ add this in functions.ts
  fetchClassById,                // ✅ add/import from your classes functions
  fetchTeacherById,              // ✅ add/import from your teachers functions
  fetchStudentByQuery,           // ✅ you already have this (fix return type if needed)
} from "../../../models/questions/functions"; // 👈 adjust imports to your actual paths
import { QuestionRequest, QuestionFilters } from "../../../models/questions/types";

const router = Router();

const parseBool = (v: any): boolean | undefined => {
  if (typeof v !== "string") return undefined;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
};

const parseSide = (v: any): "brothers" | "sisters" | undefined => {
  if (typeof v !== "string") return undefined;
  if (v === "brothers" || v === "sisters") return v;
  return undefined;
};

/**
 * ✅ GET /questions
 * Optional query params:
 *  - classId (number)
 *  - studentId (number)
 *  - isPublic ("true"|"false")
 *  - published ("true"|"false")
 *  - side ("brothers"|"sisters")
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { classId, studentId, isPublic, published, side } = req.query;

    const filters: QuestionFilters = {};

    if (typeof classId === "string") {
      const parsed = Number(classId);
      if (Number.isFinite(parsed)) filters.classId = parsed;
    }

    if (typeof studentId === "string") {
      const parsed = Number(studentId);
      if (Number.isFinite(parsed)) filters.studentId = parsed;
    }

    const b1 = parseBool(isPublic);
    if (typeof b1 === "boolean") filters.isPublic = b1;

    const b2 = parseBool(published);
    if (typeof b2 === "boolean") filters.published = b2;

    const s = parseSide(side);
    if (s) filters.side = s;

    const questions = await fetchQuestions(filters);
    return res.json(questions);
  } catch (err: any) {
    console.error("Error fetching questions:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch questions" });
  }
});

/**
 * ✅ GET /questions/public?classId=47&side=sisters
 * Always returns ONLY published public questions for a class (+ optional side filter)
 */
router.get("/public", async (req: Request, res: Response) => {
  try {
    const classId = Number(req.query.classId);
    if (!Number.isFinite(classId)) {
      return res.status(400).json({ error: "classId is required" });
    }

    const side = parseSide(req.query.side);

    const questions = await fetchQuestions({
      classId,
      isPublic: true,
      published: true,
      ...(side ? { side } : {}),
    });

    return res.json({ classId, side: side ?? null, questions });
  } catch (err: any) {
    console.error("Error fetching public questions:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch public questions" });
  }
});

/**
 * ✅ GET /questions/inbox?classId=47&teacherId=12
 * Server decides which questions teacher should see:
 * - combined => all questions
 * - segregated => only questions matching teacher.side
 */
router.get("/inbox", async (req: Request, res: Response) => {
  try {
    const classId = Number(req.query.classId);
    const teacherId = Number(req.query.teacherId);

    if (!Number.isFinite(classId) || !Number.isFinite(teacherId)) {
      return res.status(400).json({ error: "classId and teacherId are required" });
    }

    const cls: any = await fetchClassById(classId);
    const teacher: any = await fetchTeacherById(teacherId);

    // You decide the column name. Examples:
    // cls.mode: "combined"|"segregated"
    // cls.isCombined: boolean
    // cls.isSegregated: boolean
    const mode =
      cls?.mode ??
      (cls?.isCombined === true ? "combined" : undefined) ??
      (cls?.isSegregated === true ? "segregated" : undefined);

    if (mode !== "combined" && mode !== "segregated") {
      return res.status(400).json({
        error:
          'Class missing mode. Add a column like mode="combined"|"segregated" or isCombined/isSegregated.',
      });
    }

    const teacherSide = parseSide(teacher?.side);
    if (mode === "segregated" && !teacherSide) {
      return res.status(400).json({ error: "Teacher side is required for segregated classes." });
    }

    const filters: QuestionFilters = { classId };
    if (mode === "segregated") filters.side = teacherSide!;

    const questions = await fetchQuestions(filters);
    return res.json({
      classId,
      teacherId,
      mode,
      side: mode === "segregated" ? teacherSide : null,
      questions,
    });
  } catch (err: any) {
    console.error("Error fetching inbox questions:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch inbox questions" });
  }
});

/**
 * ✅ GET /questions/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    const question = await fetchQuestionById(id);
    return res.json(question);
  } catch (err: any) {
    console.error("Error fetching question:", err);
    return res.status(404).json({ error: err.message || "Question not found" });
  }
});

/**
 * ✅ POST /questions
 * Body:
 * {
 *   question: string;
 *   classId: number;
 *   studentId: number;
 *   isPublic?: boolean;   // default false
 *   published?: boolean;  // default false
 * }
 *
 * side is snapped from the Student row (students.side)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<QuestionRequest>;

    if (!body.question || body.classId == null || body.studentId == null) {
      return res.status(400).json({ error: "question, classId, and studentId are required" });
    }

    const classId = Number(body.classId);
    const studentId = Number(body.studentId);

    if (!Number.isFinite(classId) || !Number.isFinite(studentId)) {
      return res.status(400).json({ error: "classId and studentId must be numbers" });
    }

    // ✅ pull side from student
    const student: any = await fetchStudentByQuery({ id: studentId });
    const studentSide = parseSide(student?.side);

    if (!studentSide) {
      return res.status(400).json({
        error: "Student side is not set. Ask the student to choose brothers/sisters first.",
      });
    }

    const payload: QuestionRequest = {
      question: String(body.question),
      classId,
      studentId,
      answer: typeof body.answer === "string" ? body.answer : null,
      isPublic: typeof body.isPublic === "boolean" ? body.isPublic : false,
      published: typeof (body as any).published === "boolean" ? (body as any).published : false,
      side: studentSide,
    };

    const created = await createQuestion(payload);
    return res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating question:", err);
    return res.status(500).json({ error: err.message || "Failed to create question" });
  }
});

/**
 * ✅ PUT /questions/:id
 * General update (admin/dev). NOTE: we do NOT allow side changes here.
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    const updates = req.body as Partial<QuestionRequest>;

    // normalize numbers if passed as strings
    if (typeof (updates as any).classId === "string") (updates as any).classId = Number((updates as any).classId);
    if (typeof (updates as any).studentId === "string") (updates as any).studentId = Number((updates as any).studentId);

    // ✅ block side edits here
    delete (updates as any).side;

    const updated = await updateQuestion(id, updates);
    return res.json(updated);
  } catch (err: any) {
    console.error("Error updating question:", err);
    return res.status(500).json({ error: err.message || "Failed to update question" });
  }
});

/**
 * ✅ PATCH /questions/:id/answer
 * Body: { answer: string | null }
 */
router.patch("/:id/answer", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    const { answer } = req.body as { answer?: string | null };

    const updated = await answerQuestion(id, typeof answer === "undefined" ? null : answer);
    return res.json(updated);
  } catch (err: any) {
    console.error("Error answering question:", err);
    return res.status(500).json({ error: err.message || "Failed to answer question" });
  }
});

/**
 * ✅ PATCH /questions/:id/visibility
 * Body: { isPublic: boolean }
 */
router.patch("/:id/visibility", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    const { isPublic } = req.body as { isPublic?: boolean };
    if (typeof isPublic !== "boolean") return res.status(400).json({ error: "isPublic must be a boolean" });

    const updated = await setQuestionVisibility(id, isPublic);
    return res.json(updated);
  } catch (err: any) {
    console.error("Error updating visibility:", err);
    return res.status(500).json({ error: err.message || "Failed to update visibility" });
  }
});

/**
 * ✅ PATCH /questions/:id/publish
 * Body: { published: boolean }
 */
router.patch("/:id/publish", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    const { published } = req.body as { published?: boolean };
    if (typeof published !== "boolean") return res.status(400).json({ error: "published must be a boolean" });

    const updated = await setQuestionPublished(id, published);
    return res.json(updated);
  } catch (err: any) {
    console.error("Error updating publish:", err);
    return res.status(500).json({ error: err.message || "Failed to update publish" });
  }
});

/**
 * ✅ DELETE /questions/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid question id" });

    await deleteQuestion(id);
    return res.status(204).send();
  } catch (err: any) {
    console.error("Error deleting question:", err);
    return res.status(500).json({ error: err.message || "Failed to delete question" });
  }
});

export default router;
