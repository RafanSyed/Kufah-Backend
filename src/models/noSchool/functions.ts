// noSchool/functions.ts
import { Op } from "sequelize";
import NoSchoolModel from "./models";
import { populateNoSchool, NoSchool } from "./aggregations";
import {
  NoSchoolRequest,
  BulkNoSchoolRequest,
  NoSchoolRangeQuery,
  NoSchoolStatusResponse,
} from "./types";

/**
 * Add a no-school day (used for "Cancel attendance for today" or holidays).
 * If the date already exists, you can either throw OR update the reason.
 * This version is "upsert-like": if exists, update reason; else create.
 */
export const addNoSchoolDay = async (data: NoSchoolRequest): Promise<NoSchool> => {
  const existing = await NoSchoolModel.findOne({ where: { date: data.date } });

  if (existing) {
    // update reason if provided (keep old if not)
    if (typeof data.reason !== "undefined") {
      existing.set("reason", data.reason);
    }
    await existing.save();
    return populateNoSchool(existing.get({ plain: true }));
  }

  const created = await NoSchoolModel.create(data as any);
  return populateNoSchool(created.get({ plain: true }));
};

/**
 * Bulk add no-school days (handy for importing a school calendar).
 * This version safely avoids duplicates using findOrCreate.
 */
export const addNoSchoolDays = async (data: BulkNoSchoolRequest): Promise<NoSchool[]> => {
  const { dates, reason } = data;

  const createdOrFound = await Promise.all(
    dates.map(async (date) => {
      const [row] = await NoSchoolModel.findOrCreate({
        where: { date },
        defaults: { date, reason: reason ?? null } as any,
      });

      // If it already existed and you provided a reason, update it
      if (row && reason && row.get("reason") !== reason) {
        row.set("reason", reason);
        await row.save();
      }

      return row;
    })
  );

  return createdOrFound.map((row) => populateNoSchool(row.get({ plain: true })));
};

/**
 * Remove a no-school day by id (if your UI stores ids).
 */
export const removeNoSchoolDayById = async (id: number): Promise<void> => {
  const row: NoSchoolModel | null = await NoSchoolModel.findByPk(id);
  if (!row) throw new Error(`NoSchool record with id ${id} not found`);
  await row.destroy();
};

/**
 * Remove a no-school day by date (best for calendar UI).
 * Returns true if deleted, false if nothing existed.
 */
export const removeNoSchoolDayByDate = async (date: string): Promise<boolean> => {
  const deletedCount = await NoSchoolModel.destroy({ where: { date } });
  return deletedCount > 0;
};

/**
 * Fetch all no-school days (use sparingly).
 */
export const fetchAllNoSchoolDays = async (): Promise<NoSchool[]> => {
  const records: NoSchoolModel[] = await NoSchoolModel.findAll({
    order: [["date", "ASC"]],
  });
  return records.map((r) => populateNoSchool(r.get({ plain: true })));
};

/**
 * Fetch no-school days in a date range (calendar UI).
 * Expect "from" and "to" as YYYY-MM-DD.
 */
export const fetchNoSchoolDaysInRange = async (
  query: NoSchoolRangeQuery
): Promise<NoSchool[]> => {
  const { from, to } = query;

  const records: NoSchoolModel[] = await NoSchoolModel.findAll({
    where: {
      date: {
        [Op.between]: [from, to],
      },
    },
    order: [["date", "ASC"]],
  });

  return records.map((r) => populateNoSchool(r.get({ plain: true })));
};

/**
 * Check if a given date is a no-school day (cron gate).
 */
export const isNoSchoolDay = async (date: string): Promise<NoSchoolStatusResponse> => {
  const row = await NoSchoolModel.findOne({ where: { date } });

  return {
    blocked: !!row,
    date,
    reason: row ? (row.get("reason") as string | null) : null,
  };
};

/**
 * Convenience function for "Cancel attendance today" button.
 * Just writes today's date into noSchool table with default reason if missing.
 */
export const cancelAttendanceForDate = async (
  date: string,
  reason = "Manual cancel"
): Promise<NoSchool> => {
  return addNoSchoolDay({ date, reason });
};

/**
 * Convenience function for "Undo cancel" (delete today's noSchool row).
 */
export const undoCancelAttendanceForDate = async (date: string): Promise<boolean> => {
  return removeNoSchoolDayByDate(date);
};
