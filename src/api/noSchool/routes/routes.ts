// src/backend/api/noSchool/routes/routes.ts
import { Router, Request, Response } from "express";
import {
  addNoSchoolDay,
  addNoSchoolDays,
  removeNoSchoolDayById,
  removeNoSchoolDayByDate,
  fetchAllNoSchoolDays,
  fetchNoSchoolDaysInRange,
  isNoSchoolDay,
  cancelAttendanceForDate,
  undoCancelAttendanceForDate,
} from "../../../models/noSchool/functions";
import {
  NoSchoolRequest,
  BulkNoSchoolRequest,
  NoSchoolRangeQuery,
} from "../../../models/noSchool/types";

const router = Router();

/**
 * GET: list all no-school days (use sparingly)
 * GET /api/noSchool
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const days = await fetchAllNoSchoolDays();
    res.json(days);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET: list no-school days in a range (for calendar UI)
 * GET /api/noSchool/range?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get("/range", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as unknown as NoSchoolRangeQuery;

    if (!from || !to) {
      return res.status(400).json({ message: "from and to query params are required" });
    }

    const days = await fetchNoSchoolDaysInRange({ from, to });
    res.json(days);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET: check if a specific date is blocked (cron gate)
 * GET /api/noSchool/check/:date   (date = YYYY-MM-DD)
 */
router.get("/check/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: "date param is required (YYYY-MM-DD)" });
    }

    const status = await isNoSchoolDay(date);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST: add a no-school day (holiday/manual cancel)
 * POST /api/noSchool
 * body: { date: "YYYY-MM-DD", reason?: string }
 */
router.post("/", async (req: Request<{}, {}, NoSchoolRequest>, res: Response) => {
  try {
    if (!req.body?.date) {
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    }

    const created = await addNoSchoolDay(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST: bulk add no-school days
 * POST /api/noSchool/bulk
 * body: { dates: ["YYYY-MM-DD", ...], reason?: string }
 */
router.post("/bulk", async (req: Request<{}, {}, BulkNoSchoolRequest>, res: Response) => {
  try {
    const { dates } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: "dates[] is required and must be non-empty" });
    }

    const created = await addNoSchoolDays(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE: remove no-school day by id
 * DELETE /api/noSchool/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "valid id param is required" });

    await removeNoSchoolDayById(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE: remove no-school day by date (best for calendar toggle)
 * DELETE /api/noSchool/date/:date
 */
router.delete("/date/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ message: "date param is required (YYYY-MM-DD)" });

    const deleted = await removeNoSchoolDayByDate(date);
    res.status(200).json({ deleted, date });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST: cancel attendance for a specific date (convenience endpoint)
 * POST /api/noSchool/cancel/:date
 * This is just sugar around addNoSchoolDay({date, reason:"Manual cancel"})
 */
router.post("/cancel/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const reason = req.body?.reason || "Manual cancel";

    if (!date) return res.status(400).json({ message: "date param is required (YYYY-MM-DD)" });

    const created = await cancelAttendanceForDate(date, reason);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE: undo cancel attendance for a date (convenience endpoint)
 * DELETE /api/noSchool/cancel/:date
 */
router.delete("/cancel/:date", async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    if (!date) return res.status(400).json({ message: "date param is required (YYYY-MM-DD)" });

    const deleted = await undoCancelAttendanceForDate(date);
    res.status(200).json({ deleted, date });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
