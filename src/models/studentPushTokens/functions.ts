// src/models/pushTokens/functions.ts
import StudentPushTokenModel from "./models";
import { StudentPushToken } from "./models";
import { toPopulateStudentPushToken } from "./aggregations";
import { Op } from "sequelize";

// If you want a types.ts for this module later, you can.
// For now, we’ll just type inline:
export interface StudentPushTokenRequest {
  student_id: number;
  push_token: string;
  platform?: string | null;
  is_active?: boolean;
}

/**
 * Create a push token row (basic create).
 * NOTE: In most apps you want "register/upsert" (see registerPushToken below)
 * because devices can reinstall and re-send same token.
 */
export const createStudentPushToken = async (
  data: StudentPushTokenRequest
): Promise<StudentPushToken> => {
  const instance = await StudentPushTokenModel.create(
    {
      student_id: data.student_id,
      push_token: data.push_token,
      platform: data.platform ?? null,
      is_active: data.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    } as any
  );

  return toPopulateStudentPushToken(instance.get({ plain: true }));
};

/**
 * Fetch by DB primary key
 */
export const fetchStudentPushTokenById = async (
  id: number
): Promise<StudentPushToken> => {
  const row = await StudentPushTokenModel.findByPk(id);
  if (!row) throw new Error(`StudentPushToken with id ${id} not found`);
  return toPopulateStudentPushToken(row.get({ plain: true }));
};

/**
 * Update by id
 */
export const updateStudentPushToken = async (
  id: number,
  updates: Partial<StudentPushTokenRequest>
): Promise<StudentPushToken> => {
  const row = await StudentPushTokenModel.findByPk(id);
  if (!row) throw new Error(`StudentPushToken with id ${id} not found`);

  await row.update({
    ...updates,
    updated_at: new Date(),
  });

  return toPopulateStudentPushToken(row.get({ plain: true }));
};

/**
 * Delete by id
 */
export const deleteStudentPushToken = async (id: number): Promise<void> => {
  const row = await StudentPushTokenModel.findByPk(id);
  if (!row) throw new Error(`StudentPushToken with id ${id} not found`);
  await row.destroy();
};

/**
 * Fetch all (debug/admin)
 */
export const fetchAllStudentPushTokens = async (): Promise<StudentPushToken[]> => {
  const rows = await StudentPushTokenModel.findAll({
    order: [["updated_at", "DESC"]],
  });

  return rows.map((r) => toPopulateStudentPushToken(r.get({ plain: true })));
};

/**
 * ✅ IMPORTANT: Register token (UPSERT-BEHAVIOR)
 * - If token already exists: update student_id/platform and reactivate
 * - If it doesn't exist: create it
 *
 * This is what your Expo app should call.
 */
export const registerPushToken = async (
  data: StudentPushTokenRequest
): Promise<StudentPushToken> => {
  const { student_id, push_token, platform } = data;

  if (!student_id) throw new Error("student_id is required");
  if (!push_token) throw new Error("push_token is required");

  const existing = await StudentPushTokenModel.findOne({
    where: { push_token },
  });

  if (existing) {
    await existing.update({
      student_id,
      platform: platform ?? existing.getDataValue("platform"),
      is_active: true,
      updated_at: new Date(),
    });

    return toPopulateStudentPushToken(existing.get({ plain: true }));
  }

  const created = await StudentPushTokenModel.create(
    {
      student_id,
      push_token,
      platform: platform ?? null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    } as any
  );

  return toPopulateStudentPushToken(created.get({ plain: true }));
};

/**
 * Fetch active tokens for a student (this is what the worker uses)
 */
export const fetchActiveTokensForStudent = async (
  student_id: number
): Promise<StudentPushToken[]> => {
  const rows = await StudentPushTokenModel.findAll({
    where: {
      student_id,
      is_active: true,
    },
    order: [["updated_at", "DESC"]],
  });

  return rows.map((r) => toPopulateStudentPushToken(r.get({ plain: true })));
};

/**
 * Fetch active tokens for many students at once (more efficient for worker)
 */
export const fetchActiveTokensForStudents = async (
  studentIds: number[]
): Promise<StudentPushToken[]> => {
  if (!studentIds.length) return [];

  const rows = await StudentPushTokenModel.findAll({
    where: {
      student_id: { [Op.in]: studentIds },
      is_active: true,
    },
  });

  return rows.map((r) => toPopulateStudentPushToken(r.get({ plain: true })));
};

/**
 * Deactivate a token (use when Expo returns "DeviceNotRegistered")
 */
export const deactivatePushToken = async (push_token: string): Promise<void> => {
  const row = await StudentPushTokenModel.findOne({ where: { push_token } });
  if (!row) return;

  await row.update({
    is_active: false,
    updated_at: new Date(),
  });
};

/**
 * Deactivate by id (optional convenience)
 */
export const deactivatePushTokenById = async (id: number): Promise<void> => {
  const row = await StudentPushTokenModel.findByPk(id);
  if (!row) return;

  await row.update({
    is_active: false,
    updated_at: new Date(),
  });
};
