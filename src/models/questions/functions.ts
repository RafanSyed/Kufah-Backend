// models/questions/functions.ts
import QuestionsModel from "./models";
import {
  QuestionRequest,
  QuestionFilters,
  QuestionAttributes,
} from "./types";

// ✅ add these imports (adjust paths to your project)
import ClassModel from "../classes/models";
import TeacherModel from "../teachers/models";
import StudentModel from "../students/models";

type QuestionInstance = QuestionsModel & QuestionAttributes;

/**
 * Create a new question.
 * ✅ now stores published + side too
 */
export async function createQuestion(
  payload: QuestionRequest
): Promise<QuestionInstance> {
  const created = await QuestionsModel.create({
    question: payload.question,
    answer: payload.answer ?? null,
    isPublic: payload.isPublic ?? false, // ✅ default false is safer
    classId: payload.classId,
    studentId: payload.studentId,
    published: payload.published ?? false,
    side: payload.side ?? null,
  });

  return created as QuestionInstance;
}

/**
 * Fetch a single question by id.
 */
export async function fetchQuestionById(id: number): Promise<QuestionInstance> {
  const q = await QuestionsModel.findByPk(id);
  if (!q) throw new Error("Question not found");
  return q as QuestionInstance;
}

/**
 * Fetch many questions with optional filters.
 * ✅ now supports published + side
 */
export async function fetchQuestions(
  filters: QuestionFilters = {}
): Promise<QuestionInstance[]> {
  const where: any = {};

  if (typeof filters.classId === "number") where.classId = filters.classId;
  if (typeof filters.studentId === "number") where.studentId = filters.studentId;
  if (typeof filters.isPublic === "boolean") where.isPublic = filters.isPublic;

  // ✅ NEW
  if (typeof filters.published === "boolean") where.published = filters.published;
  if (filters.side === "brothers" || filters.side === "sisters") where.side = filters.side;

  const questions = await QuestionsModel.findAll({
    where,
    order: [["id", "DESC"]], // timestamps are false, so id works
  });

  return questions as QuestionInstance[];
}

/**
 * Update a question (question text, answer, visibility, classId, studentId, published).
 * ❗ Do NOT allow changing side here (side should come from student on create).
 */
export async function updateQuestion(
  id: number,
  updates: Partial<QuestionRequest>
): Promise<QuestionInstance> {
  const q = await fetchQuestionById(id);

  if (typeof updates.question === "string") q.question = updates.question;
  if (typeof updates.answer !== "undefined") q.answer = updates.answer ?? null;
  if (typeof updates.isPublic === "boolean") q.isPublic = updates.isPublic;
  if (typeof updates.classId === "number") q.classId = updates.classId;
  if (typeof updates.studentId === "number") q.studentId = updates.studentId;

  // ✅ NEW
  if (typeof (updates as any).published === "boolean") {
    (q as any).published = (updates as any).published;
  }

  // 🚫 ignore side changes
  // if ((updates as any).side) ...

  await q.save();
  return q;
}

/**
 * Simple helper for just answering a question.
 */
export async function answerQuestion(
  id: number,
  answerText: string | null
): Promise<QuestionInstance> {
  const q = await fetchQuestionById(id);
  q.answer = answerText;
  await q.save();
  return q;
}

/**
 * Toggle public/private flag.
 */
export async function setQuestionVisibility(
  id: number,
  isPublic: boolean
): Promise<QuestionInstance> {
  const q = await fetchQuestionById(id);
  q.isPublic = isPublic;
  await q.save();
  return q;
}

/**
 * ✅ NEW: Toggle published flag (teacher making it public for students).
 */
export async function setQuestionPublished(
  id: number,
  published: boolean
): Promise<QuestionInstance> {
  const q = await fetchQuestionById(id);
  (q as any).published = published;
  await q.save();
  return q;
}

/**
 * Delete a question.
 */
export async function deleteQuestion(id: number): Promise<void> {
  const q = await fetchQuestionById(id);
  await q.destroy();
}

/* =======================================================================================
   ✅ "Missing" helper fetches you asked for
   NOTE: these live here just so you can import them easily from routes/questions.ts,
   but you can move them to their own modules if you prefer.
======================================================================================= */

/**
 * ✅ fetchClassById
 * Used for figuring out combined vs segregated class routing.
 */
export async function fetchClassById(classId: number): Promise<any> {
  const cls = await ClassModel.findByPk(classId);
  if (!cls) throw new Error("Class not found");
  return cls.get({ plain: true });
}

/**
 * ✅ fetchTeacherById
 * Used for segregated classes to filter by teacher.side.
 */
export async function fetchTeacherById(teacherId: number): Promise<any> {
  const t = await TeacherModel.findByPk(teacherId);
  if (!t) throw new Error("Teacher not found");
  return t.get({ plain: true });
}

/**
 * ✅ fetchStudentByQuery
 * You said you already have this, but your version looked like it returns populateStudentClass()
 * and had a weird type mismatch. Here’s the clean version.
 */
export async function fetchStudentByQuery(query: Partial<{ id: number; email: string }>): Promise<any> {
  const student = await StudentModel.findOne({ where: query as any });
  if (!student) throw new Error(`Student not found with query ${JSON.stringify(query)}`);
  return student.get({ plain: true });
}
