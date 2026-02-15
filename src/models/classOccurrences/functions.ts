// src/backend/models/classOccurrences/functions.ts
import { Op } from "sequelize";
import { toZonedTime, format, fromZonedTime } from "date-fns-tz";
import ClassOccurrenceModel, { ClassOccurrence } from "./models";
import { ClassOccurrenceRequest } from "./types";
import { toPopulateClassOccurrence } from "./aggregations";
import { removeAttendance, fetchAttendanceByClass, fetchAttendanceByDate } from "../attendance/functions";
import ClassModel from "../classes/models";

// ---------------- helpers ----------------

/**
 * Helper to get attendance for a specific class on a specific date
 * Combines your existing fetchAttendanceByDate and filters by class_id
 */
const getAttendanceByClassAndDate = async (classId: number, date: Date): Promise<any[]> => {
  // Get all attendance for this date
  const allAttendanceOnDate = await fetchAttendanceByDate(date);
  
  // Filter by class_id
  return allAttendanceOnDate.filter((att: any) => {
    const attClassId = att.class_id || att.getClassId?.();
    return Number(attClassId) === Number(classId);
  });
};

const parseTime = (timeString: string): { hours: number; minutes: number; seconds: number } => {
  const parts = (timeString || "").split(":");
  const hours = parseInt(parts[0] || "0", 10) || 0;
  const minutes = parseInt(parts[1] || "0", 10) || 0;
  const seconds = parseInt(parts[2] || "0", 10) || 0;
  return { hours, minutes, seconds };
};

// ✅ Build the correct UTC Date for "dateISO + classTime" in the given timezone.
const buildStartsAtForDate = (dateISO: string, timeZone: string, classTime: string): Date => {
  const { hours, minutes, seconds } = parseTime(classTime);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const localDateTime = `${dateISO} ${hh}:${mm}:${ss}`;
  return fromZonedTime(localDateTime, timeZone);
};

// ---------------- basic CRUD ----------------

export const createClassOccurrence = async (
  payload: Partial<ClassOccurrenceRequest> & {
    class_id: number;
    date: string;
    starts_at: Date;
  }
): Promise<ClassOccurrence> => {
  const created = await ClassOccurrenceModel.create({
    class_id: payload.class_id,
    date: payload.date,
    starts_at: payload.starts_at,
    processed_at: payload.processed_at ?? null,
    cancelled_at: payload.cancelled_at ?? null,
    created_at: payload.created_at ?? new Date(),
    updated_at: payload.updated_at ?? new Date(),
  } as any);
  return toPopulateClassOccurrence(created.get({ plain: true }));
};

export const fetchClassOccurrenceById = async (id: number): Promise<ClassOccurrence> => {
  const row = await ClassOccurrenceModel.findByPk(id);
  if (!row) throw new Error(`Class occurrence with id ${id} not found`);
  return toPopulateClassOccurrence(row.get({ plain: true }));
};

export const updateClassOccurrence = async (
  id: number,
  updates: Partial<ClassOccurrenceRequest>
): Promise<ClassOccurrence> => {
  const row = await ClassOccurrenceModel.findByPk(id);
  if (!row) throw new Error(`Class occurrence with id ${id} not found`);
  await row.update({
    ...updates,
    updated_at: new Date(),
  });
  return toPopulateClassOccurrence(row.get({ plain: true }));
};

export const deleteClassOccurrence = async (id: number): Promise<void> => {
  const row = await ClassOccurrenceModel.findByPk(id);
  if (!row) throw new Error(`Class occurrence with id ${id} not found`);
  await row.destroy();
};

export const fetchAllClassOccurrences = async (): Promise<ClassOccurrence[]> => {
  const rows = await ClassOccurrenceModel.findAll({ order: [["starts_at", "ASC"]] });
  return rows.map((r) => toPopulateClassOccurrence(r.get({ plain: true })));
};

export const fetchClassOccurrencesByDate = async (dateISO: string): Promise<ClassOccurrence[]> => {
  const rows = await ClassOccurrenceModel.findAll({
    where: { date: dateISO },
    order: [["starts_at", "ASC"]],
  });
  return rows.map((r) => toPopulateClassOccurrence(r.get({ plain: true })));
};

// ---------------- scheduling-specific ----------------

/**
 * Build / upsert today's occurrences.
 * Run once per day (00:01) OR when your worker notices a new day.
 *
 * Requires DB unique constraint: UNIQUE(class_id, date)
 */
export const buildTodayClassOccurrences = async (
  timeZone = "America/New_York"
): Promise<ClassOccurrence[]> => {
  const nowUtc = new Date();
  const nowZoned = toZonedTime(nowUtc, timeZone);
  const dayShort = format(nowZoned, "EEE", { timeZone });
  const isoDate = format(nowZoned, "yyyy-MM-dd", { timeZone });

  const classes = await ClassModel.findAll({
    where: { days: { [Op.contains]: [dayShort] } },
    order: [["time", "ASC"]],
  });

  for (const cls of classes) {
    const plain = cls.get({ plain: true }) as any;
    const startsAt = buildStartsAtForDate(isoDate, timeZone, plain.time);

    await ClassOccurrenceModel.upsert({
      class_id: plain.id,
      date: isoDate,
      starts_at: startsAt,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);
  }

  const rows = await ClassOccurrenceModel.findAll({
    where: { date: isoDate },
    order: [["starts_at", "ASC"]],
  });
  return rows.map((r) => toPopulateClassOccurrence(r.get({ plain: true })));
};

/**
 * Fetch occurrences that are due now (or slightly overdue) and not processed.
 * 🆕 Now filters out cancelled occurrences
 */
export const fetchDueUnprocessedOccurrences = async (
  timeZone = "America/New_York",
  windowMinutes = 2
): Promise<ClassOccurrence[]> => {
  const nowUtc = new Date();
  const windowStartUtc = new Date(nowUtc.getTime() - windowMinutes * 60 * 1000);
  const isoDate = format(toZonedTime(nowUtc, timeZone), "yyyy-MM-dd", { timeZone });

  const rows = await ClassOccurrenceModel.findAll({
    where: {
      processed_at: { [Op.is]: null },
      cancelled_at: { [Op.is]: null }, // 🆕 Skip cancelled occurrences
      date: isoDate,
      starts_at: {
        [Op.lte]: nowUtc,
        [Op.gte]: windowStartUtc,
      },
    },
    order: [["starts_at", "ASC"]],
  });
  return rows.map((r) => toPopulateClassOccurrence(r.get({ plain: true })));
};

/**
 * Mark an occurrence processed (attendance created + push sent)
 */
export const markOccurrenceProcessed = async (occurrenceId: number): Promise<ClassOccurrence> => {
  const row = await ClassOccurrenceModel.findByPk(occurrenceId);
  if (!row) throw new Error(`Class occurrence with id ${occurrenceId} not found`);
  await row.update({
    processed_at: new Date(),
    updated_at: new Date(),
  });
  return toPopulateClassOccurrence(row.get({ plain: true }));
};

/**
 * 🆕 Cancel a class occurrence
 * - If before class time: marks as cancelled (prevents attendance creation)
 * - If after class time: marks as cancelled AND deletes any existing attendance
 */
export const cancelClassOccurrence = async (occurrenceId: number): Promise<{
  occurrence: any;
  deletedAttendanceCount: number;
}> => {
  const row = await ClassOccurrenceModel.findByPk(occurrenceId);
  
  if (!row) {
    throw new Error(`Class occurrence ${occurrenceId} not found`);
  }

  const plain = row.get({ plain: true }) as any;
  
  if (plain.cancelled_at) {
    throw new Error(`Class occurrence ${occurrenceId} is already cancelled`);
  }

  const now = new Date();
  const startsAt = new Date(plain.starts_at);
  const classId = plain.class_id;
  
  // Mark as cancelled
  await row.update({
    cancelled_at: now,
    updated_at: now,
  });

  let deletedCount = 0;

  // If class already started/passed, delete any attendance rows
  if (now >= startsAt) {
    console.log(`[cancelClassOccurrence] Class ${classId} already started, deleting attendance...`);
    
    try {
      const attendanceRows = await getAttendanceByClassAndDate(classId, startsAt);
      
      console.log(`[cancelClassOccurrence] Found ${attendanceRows.length} attendance rows to delete`);
      
      for (const att of attendanceRows) {
        const attId = att.id || att.getId?.();
        if (attId) {
          await removeAttendance(attId);
          deletedCount++;
        }
      }
      
      console.log(`[cancelClassOccurrence] Deleted ${deletedCount} attendance rows`);
    } catch (err) {
      console.error(`[cancelClassOccurrence] Error deleting attendance:`, err);
    }
  } else {
    console.log(`[cancelClassOccurrence] Class ${classId} hasn't started yet, no attendance to delete`);
  }

  // Fetch updated row to return
  const updated = await ClassOccurrenceModel.findByPk(occurrenceId);
  
  return {
    occurrence: updated?.get({ plain: true }),
    deletedAttendanceCount: deletedCount,
  };
};

/**
 * 🆕 Uncancel a class occurrence (restore it)
 * Note: Does NOT recreate deleted attendance rows
 */
export const uncancelClassOccurrence = async (occurrenceId: number): Promise<any> => {
  const row = await ClassOccurrenceModel.findByPk(occurrenceId);
  
  if (!row) {
    throw new Error(`Class occurrence ${occurrenceId} not found`);
  }

  const plain = row.get({ plain: true }) as any;
  
  if (!plain.cancelled_at) {
    throw new Error(`Class occurrence ${occurrenceId} is not cancelled`);
  }

  await row.update({
    cancelled_at: null,
    updated_at: new Date(),
  });

  console.log(`[uncancelClassOccurrence] Uncancelled occurrence ${occurrenceId}`);
  
  const updated = await ClassOccurrenceModel.findByPk(occurrenceId);
  return updated?.get({ plain: true });
};