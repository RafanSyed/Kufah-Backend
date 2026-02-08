// src/backend/models/classOccurrences/functions.ts
import { Op } from "sequelize";
import { toZonedTime, format } from "date-fns-tz";

import ClassOccurrenceModel from "./models";
import { ClassOccurrence } from "./models";
import { ClassOccurrenceRequest } from "./types";
import { toPopulateClassOccurrence } from "./aggregations";

import ClassModel from "../classes/models";

// ---------------- helpers ----------------
const parseTime = (timeString: string): { hours: number; minutes: number; seconds: number } => {
  const parts = (timeString || "").split(":");
  const hours = parseInt(parts[0] || "0", 10) || 0;
  const minutes = parseInt(parts[1] || "0", 10) || 0;
  const seconds = parseInt(parts[2] || "0", 10) || 0;
  return { hours, minutes, seconds };
};

// Build a Date for "dateISO + classTime" in the given timezone
const buildStartsAtForDate = (dateISO: string, timeZone: string, classTime: string): Date => {
  // dateISO is "YYYY-MM-DD"
  const baseZoned = toZonedTime(new Date(`${dateISO}T00:00:00`), timeZone);
  const { hours, minutes, seconds } = parseTime(classTime);

  const startsAt = new Date(baseZoned);
  startsAt.setHours(hours, minutes, seconds, 0);
  return startsAt;
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
    updated_at: new Date(), // keep consistent with your style
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
  const nowZoned = toZonedTime(new Date(), timeZone);
  const dayShort = format(nowZoned, "EEE", { timeZone }); // "Mon", "Tue"...
  const isoDate = format(nowZoned, "yyyy-MM-dd", { timeZone }); // "2026-02-08"

  const classes = await ClassModel.findAll({
    where: { days: { [Op.contains]: [dayShort] } },
    order: [["time", "ASC"]],
  });

  for (const cls of classes) {
    const plain = cls.get({ plain: true }) as any;
    const startsAt = buildStartsAtForDate(isoDate, timeZone, plain.time);

    // upsert so duplicates are impossible (needs UNIQUE(class_id, date))
    await ClassOccurrenceModel.upsert({
      class_id: plain.id,
      date: isoDate,
      starts_at: startsAt,
      processed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);
  }

  // return today's occurrences (helpful for debugging)
  const rows = await ClassOccurrenceModel.findAll({
    where: { date: isoDate },
    order: [["starts_at", "ASC"]],
  });

  return rows.map((r) => toPopulateClassOccurrence(r.get({ plain: true })));
};

/**
 * Fetch occurrences that are due now (or slightly overdue) and not processed.
 * windowMinutes lets you catch up after restarts.
 */
export const fetchDueUnprocessedOccurrences = async (
  timeZone = "America/New_York",
  windowMinutes = 2
): Promise<ClassOccurrence[]> => {
  const nowZoned = toZonedTime(new Date(), timeZone);
  const windowStart = new Date(nowZoned.getTime() - windowMinutes * 60 * 1000);

  const rows = await ClassOccurrenceModel.findAll({
    where: {
      processed_at: { [Op.is]: null },
      starts_at: {
        [Op.lte]: nowZoned,
        [Op.gte]: windowStart,
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
