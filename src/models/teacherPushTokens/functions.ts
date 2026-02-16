// src/backend/models/teacherPushTokens/functions.ts
import TeacherPushTokenModel, { TeacherPushToken } from "./models";
import { teacherPushTokenRequest } from "./types";
import { toPopulateTeacherPushToken } from "./aggregations";
import { Op } from "sequelize";

/**
 * Register/upsert teacher push token
 */
export const registerTeacherPushToken = async (
  data: teacherPushTokenRequest
): Promise<TeacherPushToken> => {
  const { teacher_id, push_token, platform } = data;

  if (!teacher_id) throw new Error("teacher_id is required");
  if (!push_token) throw new Error("push_token is required");

  const existing = await TeacherPushTokenModel.findOne({
    where: { push_token },
  });

  if (existing) {
    await existing.update({
      teacher_id,
      platform: platform ?? existing.getDataValue("platform"),
      is_active: true,
      updated_at: new Date(),
    });

    return toPopulateTeacherPushToken(existing.get({ plain: true }));
  }

  const created = await TeacherPushTokenModel.create({
    teacher_id,
    push_token,
    platform: platform ?? null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  } as any);

  return toPopulateTeacherPushToken(created.get({ plain: true }));
};

/**
 * Get active tokens for a teacher
 */
export const fetchActiveTokensForTeacher = async (
  teacher_id: number
): Promise<TeacherPushToken[]> => {
  const rows = await TeacherPushTokenModel.findAll({
    where: {
      teacher_id,
      is_active: true,
    },
  });

  return rows.map((r) => toPopulateTeacherPushToken(r.get({ plain: true })));
};

/**
 * Get active tokens for multiple teachers
 */
export const fetchActiveTokensForTeachers = async (
  teacherIds: number[]
): Promise<TeacherPushToken[]> => {
  if (!teacherIds.length) return [];

  const rows = await TeacherPushTokenModel.findAll({
    where: {
      teacher_id: { [Op.in]: teacherIds },
      is_active: true,
    },
  });

  return rows.map((r) => toPopulateTeacherPushToken(r.get({ plain: true })));
};

/**
 * Deactivate a token
 */
export const deactivateTeacherPushToken = async (push_token: string): Promise<void> => {
  const row = await TeacherPushTokenModel.findOne({ where: { push_token } });
  if (!row) return;

  await row.update({
    is_active: false,
    updated_at: new Date(),
  });
};