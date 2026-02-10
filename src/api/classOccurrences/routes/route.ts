// src/backend/api/classOccurrences/routes/routes.ts
import { Router, Request, Response } from "express";
import {
  createClassOccurrence,
  fetchClassOccurrenceById,
  updateClassOccurrence,
  deleteClassOccurrence,
  fetchAllClassOccurrences,
  fetchClassOccurrencesByDate,
  buildTodayClassOccurrences,
  fetchDueUnprocessedOccurrences,
  markOccurrenceProcessed,
} from "../../../models/classOccurrences/functions";

import { ClassOccurrenceRequest } from "../../../models/classOccurrences/types";

const router = Router();

/**
 * IMPORTANT ROUTE ORDER NOTE:
 * Put specific/static routes BEFORE "/:id"
 * DO NOT use "/:id(\\d+)" style regex here (breaks with your path-to-regexp version)
 */

// ------------------- GET all occurrences -------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchAllClassOccurrences();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET occurrences for a date -------------------
// GET /api/class-occurrences/date/2026-02-08
router.get("/date/:date", async (req: Request, res: Response) => {
  try {
    const dateParam = req.params.date;

    if (!dateParam) {
      return res.status(400).json({ message: "date param is required" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const rows = await fetchClassOccurrencesByDate(dateParam);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- POST build today's occurrences (manual trigger) -------------------
// POST /api/class-occurrences/build-today
router.post("/build-today", async (_req: Request, res: Response) => {
  try {
    const rows = await buildTodayClassOccurrences("America/New_York");
    res.status(201).json(rows);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET due unprocessed occurrences (debug) -------------------
// GET /api/class-occurrences/due?windowMinutes=2
router.get("/due", async (req: Request, res: Response) => {
  try {
    const windowMinutesRaw = req.query.windowMinutes as string | undefined;
    const windowMinutes = windowMinutesRaw ? Number(windowMinutesRaw) : 2;

    if (!Number.isFinite(windowMinutes) || windowMinutes <= 0 || windowMinutes > 60) {
      return res.status(400).json({ message: "windowMinutes must be a number between 1 and 60." });
    }

    const rows = await fetchDueUnprocessedOccurrences("America/New_York", windowMinutes);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- POST create a class occurrence -------------------
router.post("/", async (req: Request<{}, {}, Partial<ClassOccurrenceRequest>>, res: Response) => {
  try {
    const body = req.body;

    if (!body.class_id) {
      return res.status(400).json({ message: "class_id is required" });
    }
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return res.status(400).json({ message: "date is required in YYYY-MM-DD format" });
    }
    if (!body.starts_at) {
      return res.status(400).json({ message: "starts_at is required" });
    }

    const created = await createClassOccurrence({
      class_id: Number(body.class_id),
      date: body.date,
      starts_at: new Date(body.starts_at as any),
      processed_at: body.processed_at ?? null,
      created_at: body.created_at ? new Date(body.created_at as any) : new Date(),
      updated_at: body.updated_at ? new Date(body.updated_at as any) : new Date(),
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// ------------------- PATCH mark processed -------------------
// PATCH /api/class-occurrences/123/mark-processed
router.patch("/:id/mark-processed", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updated = await markOccurrenceProcessed(id);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- GET by id -------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const row = await fetchClassOccurrenceById(id);
    res.json(row);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- PUT update -------------------
router.put("/:id", async (req: Request<{ id: string }, {}, Partial<ClassOccurrenceRequest>>, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updated = await updateClassOccurrence(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- DELETE -------------------
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    await deleteClassOccurrence(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

export default router;
