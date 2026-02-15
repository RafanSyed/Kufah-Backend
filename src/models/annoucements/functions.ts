// src/backend/models/announcements/functions.ts
import { Op } from "sequelize";
import AnnouncementModel, { Announcement } from "./models";
import { AnnouncementRequest } from "./types";
import { populateAnnouncement } from "./aggregations";
import { fetchClassesForStudent } from "../studentClasses/functions";

/**
 * Create a new announcement
 */
export const createAnnouncement = async (
  data: Partial<AnnouncementRequest> & {
    teacher_id: number;
    title: string;
    message: string;
  }
): Promise<Announcement> => {
  const created = await AnnouncementModel.create({
    teacher_id: data.teacher_id,
    class_id: data.class_id ?? null,
    target_side: data.target_side ?? null,
    title: data.title,
    message: data.message,
    created_at: data.created_at ?? new Date(),
    updated_at: data.updated_at ?? new Date(),
  } as any);

  return populateAnnouncement(created.get({ plain: true }));
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (id: number): Promise<Announcement> => {
  const row = await AnnouncementModel.findByPk(id);
  if (!row) throw new Error(`Announcement ${id} not found`);
  return populateAnnouncement(row.get({ plain: true }));
};

/**
 * Get all announcements (optionally filtered)
 */
export const getAllAnnouncements = async (filters?: {
  teacher_id?: number;
  class_id?: number | null;
  limit?: number;
}): Promise<Announcement[]> => {
  const where: any = {};
  
  if (filters?.teacher_id) {
    where.teacher_id = filters.teacher_id;
  }
  
  if (filters?.class_id !== undefined) {
    where.class_id = filters.class_id;
  }

  const rows = await AnnouncementModel.findAll({
    where,
    order: [["created_at", "DESC"]],
    limit: filters?.limit || 100,
  });

  return rows.map((r) => populateAnnouncement(r.get({ plain: true })));
};

/**
 * Get announcements for a specific student
 * Returns announcements where:
 * 1. class_id is null (all students)
 * 2. student is in the class AND (target_side matches student's side OR target_side is null)
 */
export const getAnnouncementsForStudent = async (
  studentId: number,
  studentSide: string // "brothers" or "sisters"
): Promise<Announcement[]> => {
  // Get all classes this student is enrolled in
  const studentClasses = await fetchClassesForStudent(studentId);
  
  // Extract class IDs
  const classIds = studentClasses
    .map((sc) => sc.classId)
    .filter((id): id is number => id !== null && id !== undefined);

  // Query announcements
  const rows = await AnnouncementModel.findAll({
    where: {
      [Op.or]: [
        // All-student announcements (class_id is null)
        { class_id: null },
        // Class-specific announcements
        {
          class_id: { [Op.in]: classIds },
          [Op.or]: [
            { target_side: null }, // Combined class or no side specified
            { target_side: studentSide }, // Matches student's side
          ],
        },
      ],
    },
    order: [["created_at", "DESC"]],
    limit: 50,
  });

  return rows.map((r) => populateAnnouncement(r.get({ plain: true })));
};

/**
 * Get announcements for a specific class
 */
export const getAnnouncementsByClass = async (classId: number): Promise<Announcement[]> => {
  const rows = await AnnouncementModel.findAll({
    where: { class_id: classId },
    order: [["created_at", "DESC"]],
  });

  return rows.map((r) => populateAnnouncement(r.get({ plain: true })));
};

/**
 * Get announcements created by a specific teacher
 */
export const getAnnouncementsByTeacher = async (teacherId: number): Promise<Announcement[]> => {
  const rows = await AnnouncementModel.findAll({
    where: { teacher_id: teacherId },
    order: [["created_at", "DESC"]],
  });

  return rows.map((r) => populateAnnouncement(r.get({ plain: true })));
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (
  id: number,
  updates: Partial<AnnouncementRequest>
): Promise<Announcement> => {
  const row = await AnnouncementModel.findByPk(id);
  if (!row) throw new Error(`Announcement ${id} not found`);

  await row.update({
    ...updates,
    updated_at: new Date(),
  });

  return populateAnnouncement(row.get({ plain: true }));
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (id: number): Promise<void> => {
  const row = await AnnouncementModel.findByPk(id);
  if (!row) throw new Error(`Announcement ${id} not found`);
  await row.destroy();
};