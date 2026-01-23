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
} from "../../../models/questions/functions";
import {
  QuestionRequest,
  QuestionFilters,
} from "../../../models/questions/types";

const router = Router();

/**
 * GET /questions
 * Optional query params:
 *  - classId      (number)
 *  - studentId    (number)
 *  - isPublic     (boolean "true" | "false")
 *  - published    (boolean "true" | "false")
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { classId, studentId, isPublic, published } = req.query;

    const filters: QuestionFilters = {};

    if (typeof classId === "string") {
      const parsed = Number(classId);
      if (!Number.isNaN(parsed)) {
        filters.classId = parsed;
      }
    }

    if (typeof studentId === "string") {
      const parsed = Number(studentId);
      if (!Number.isNaN(parsed)) {
        filters.studentId = parsed;
      }
    }

    if (typeof isPublic === "string") {
      filters.isPublic = isPublic === "true";
    }

    if (typeof published === "string") {
      filters.published = published === "true";
    }

    const questions = await fetchQuestions(filters);
    res.json(questions);
  } catch (err: any) {
    console.error("Error fetching questions:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch questions" });
  }
});

/**
 * GET /questions/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    const question = await fetchQuestionById(id);
    res.json(question);
  } catch (err: any) {
    console.error("Error fetching question:", err);
    res.status(404).json({ error: err.message || "Question not found" });
  }
});

/**
 * POST /questions
 * Body: QuestionRequest
 * {
 *   question: string;
 *   answer?: string | null;
 *   isPublic?: boolean;
 *   classId: number;
 *   studentId: number;
 *   published?: boolean;
 * }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<QuestionRequest>;

    if (!body.question || !body.classId || !body.studentId) {
      return res.status(400).json({
        error: "question, classId, and studentId are required",
      });
    }

    const payload: QuestionRequest = {
      question: body.question,
      classId: Number(body.classId),
      studentId: Number(body.studentId),
      answer: typeof body.answer === "string" ? body.answer : null,
      isPublic:
        typeof body.isPublic === "boolean" ? body.isPublic : true,
      // 👇 new field – default to false if not provided
      published: true
    };

    const created = await createQuestion(payload);
    res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating question:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create question" });
  }
});

/**
 * PUT /questions/:id
 * Body: partial QuestionRequest (can update question, answer, isPublic, classId, studentId, published)
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    const updates = req.body as Partial<QuestionRequest>;

    if (typeof updates.classId === "string") {
      updates.classId = Number(updates.classId);
    }
    if (typeof updates.studentId === "string") {
      updates.studentId = Number(updates.studentId);
    }
    // published will already be boolean when coming from JSON body,
    // so no extra conversion needed unless you're sending strings.

    const updated = await updateQuestion(id, updates);
    res.json(updated);
  } catch (err: any) {
    console.error("Error updating question:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to update question" });
  }
});

/**
 * PATCH /questions/:id/answer
 * Body: { answer: string | null }
 */
router.patch("/:id/answer", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    const { answer } = req.body as { answer?: string | null };

    const updated = await answerQuestion(
      id,
      typeof answer === "undefined" ? null : answer
    );
    res.json(updated);
  } catch (err: any) {
    console.error("Error answering question:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to answer question" });
  }
});

/**
 * PATCH /questions/:id/visibility
 * Body: { isPublic: boolean }
 */
router.patch("/:id/visibility", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    const { isPublic } = req.body as { isPublic?: boolean };

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ error: "isPublic must be a boolean" });
    }

    const updated = await setQuestionVisibility(id, isPublic);
    res.json(updated);
  } catch (err: any) {
    console.error("Error updating visibility:", err);
    res.status(500).json({
      error: err.message || "Failed to update visibility",
    });
  }
});

/**
 * DELETE /questions/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    await deleteQuestion(id);
    res.status(204).send();
  } catch (err: any) {
    console.error("Error deleting question:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to delete question" });
  }
});

export default router;
