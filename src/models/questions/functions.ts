// models/questions/functions.ts
import QuestionsModel from "./models";
import {
  QuestionRequest,
  QuestionFilters,
  QuestionAttributes,
} from "./types";

// Tell TS what an actual instance returned from Sequelize looks like
type QuestionInstance = QuestionsModel & QuestionAttributes;

/**
 * Create a new question.
 */
export async function createQuestion(
  payload: QuestionRequest
): Promise<QuestionInstance> {
  const created = await QuestionsModel.create({
    question: payload.question,
    answer: payload.answer ?? null,
    isPublic: payload.isPublic ?? true,
    classId: payload.classId,
    studentId: payload.studentId,
  });

  return created as QuestionInstance;
}

/**
 * Fetch a single question by id.
 */
export async function fetchQuestionById(
  id: number
): Promise<QuestionInstance> {
  const q = await QuestionsModel.findByPk(id);
  if (!q) {
    throw new Error("Question not found");
  }
  return q as QuestionInstance;
}

/**
 * Fetch many questions with optional filters.
 */
export async function fetchQuestions(
  filters: QuestionFilters = {}
): Promise<QuestionInstance[]> {
  const where: any = {};

  if (typeof filters.classId === "number") {
    where.classId = filters.classId;
  }
  if (typeof filters.studentId === "number") {
    where.studentId = filters.studentId;
  }
  if (typeof filters.isPublic === "boolean") {
    where.isPublic = filters.isPublic;
  }

  const questions = await QuestionsModel.findAll({
    where,
    // use id instead of createdAt since timestamps are false
    order: [["id", "DESC"]],
  });

  return questions as QuestionInstance[];
}

/**
 * Update a question (question text, answer, visibility, etc.).
 */
export async function updateQuestion(
  id: number,
  updates: Partial<QuestionRequest>
): Promise<QuestionInstance> {
  const q = await fetchQuestionById(id);

  if (typeof updates.question === "string") {
    q.question = updates.question;
  }
  if (typeof updates.answer !== "undefined") {
    q.answer = updates.answer ?? null;
  }
  if (typeof updates.isPublic === "boolean") {
    q.isPublic = updates.isPublic;
  }
  if (typeof updates.classId === "number") {
    q.classId = updates.classId;
  }
  if (typeof updates.studentId === "number") {
    q.studentId = updates.studentId;
  }

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
 * Delete a question.
 */
export async function deleteQuestion(id: number): Promise<void> {
  const q = await fetchQuestionById(id);
  await q.destroy();
}
