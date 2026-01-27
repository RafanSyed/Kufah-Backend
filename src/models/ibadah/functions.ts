// ibadah/functions.ts
import IbadahDailyModel from "./models";
import { IbadahDaily } from "./models";
import { IbadahDailyRequest, IbadahTapRequest } from "./types";
import { populateIbadahDaily } from "./aggregations";

/**
 * Create a daily row (usually you won't call this directly; tap/upsert handles it)
 */
export const createIbadahDaily = async (
  row: IbadahDailyRequest
): Promise<IbadahDaily> => {
  const created: IbadahDailyModel = await IbadahDailyModel.create(row as any);
  return populateIbadahDaily(created.get({ plain: true }));
};

export const fetchIbadahDailyById = async (id: number): Promise<IbadahDaily> => {
  const row: IbadahDailyModel | null = await IbadahDailyModel.findByPk(id);
  if (!row) throw new Error(`IbadahDaily with id ${id} not found`);
  return populateIbadahDaily(row.get({ plain: true }));
};

/**
 * Fetch a student's daily progress for a specific day
 * day format: "YYYY-MM-DD"
 */
export const fetchIbadahDailyByStudentAndDay = async (
  student_id: number,
  day: string
): Promise<IbadahDaily | null> => {
  const row: IbadahDailyModel | null = await IbadahDailyModel.findOne({
    where: { student_id, day },
  });
  return row ? populateIbadahDaily(row.get({ plain: true })) : null;
};

/**
 * Update an existing daily row (rare; usually tap handles increments)
 */
export const updateIbadahDaily = async (
  id: number,
  updates: Partial<IbadahDailyRequest>
): Promise<IbadahDaily> => {
  const row: IbadahDailyModel | null = await IbadahDailyModel.findByPk(id);
  if (!row) throw new Error(`IbadahDaily with id ${id} not found`);
  await row.update({
    ...updates,
    updated_at: new Date(),
  });
  return populateIbadahDaily(row.get({ plain: true }));
};

export const deleteIbadahDaily = async (id: number): Promise<void> => {
  const row: IbadahDailyModel | null = await IbadahDailyModel.findByPk(id);
  if (!row) throw new Error(`IbadahDaily with id ${id} not found`);
  await row.destroy();
};

export const fetchAllIbadahDailyRows = async (): Promise<IbadahDaily[]> => {
  const rows: IbadahDailyModel[] = await IbadahDailyModel.findAll();
  return rows.map((r) => populateIbadahDaily(r.get({ plain: true })));
};

/**
 * ✅ MAIN THING YOU WANT:
 * Tap increment for a student on a given day.
 *
 * - Upserts the (student_id, day) row.
 * - Increments the right column by delta (default 1).
 */
export const tapIbadah = async (tap: IbadahTapRequest): Promise<IbadahDaily> => {
  const { student_id, type, day, delta = 1 } = tap;

  const safeDelta = Number.isFinite(delta) ? Math.max(1, Math.floor(delta)) : 1;

  const col =
    type === "salawat"
      ? "salawat_done"
      : type === "adhkar"
      ? "adhkar_done"
      : "istighfar_done";

  // Find existing row
  const existing: IbadahDailyModel | null = await IbadahDailyModel.findOne({
    where: { student_id, day },
  });

  if (!existing) {
    // Create with delta set on the target column
    const payload: any = {
      student_id,
      day,
      salawat_done: 0,
      adhkar_done: 0,
      istighfar_done: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    payload[col] = safeDelta;

    const created: IbadahDailyModel = await IbadahDailyModel.create(payload);
    return populateIbadahDaily(created.get({ plain: true }));
  }

  // Update existing: increment the right column
  const currentVal = (existing.get(col as any) as number) ?? 0;

  await existing.update({
    [col]: currentVal + safeDelta,
    updated_at: new Date(),
  } as any);

  return populateIbadahDaily(existing.get({ plain: true }));
};

/**
 * Totals across all students for a day (or lifetime if day not provided)
 */
export const fetchTotals = async (
  opts?: { day?: string }
): Promise<{ salawat: number; adhkar: number; istighfar: number }> => {
  const whereClause = opts?.day ? { day: opts.day } : undefined;

  const rows: IbadahDailyModel[] = await IbadahDailyModel.findAll({
    where: whereClause as any,
    attributes: ["salawat_done", "adhkar_done", "istighfar_done"],
  });

  let salawat = 0,
    adhkar = 0,
    istighfar = 0;

  for (const r of rows) {
    const plain: any = r.get({ plain: true });
    salawat += Number(plain.salawat_done || 0);
    adhkar += Number(plain.adhkar_done || 0);
    istighfar += Number(plain.istighfar_done || 0);
  }

  return { salawat, adhkar, istighfar };
};
