// ibadah/routes.ts
import express, { Request, Response } from "express";
import {
  createIbadahDaily,
  fetchIbadahDailyById,
  fetchIbadahDailyByStudentAndDay,
  updateIbadahDaily,
  deleteIbadahDaily,
  fetchAllIbadahDailyRows,
  tapIbadah,
  fetchTotals,
} from "../../../models/ibadah/functions";

const router = express.Router();

/**
 * Helpers
 */
const todayDateOnly = () => {
  // server-local date; if you want a specific timezone later, we can change this.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const isValidDateOnly = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

/**
 * ✅ GET /ibadah/daily/:studentId?day=YYYY-MM-DD
 * Returns that student's daily progress row (or null if none yet).
 */
router.get("/daily/:studentId", async (req: Request, res: Response) => {
  try {
    const student_id = Number(req.params.studentId);
    if (!Number.isFinite(student_id)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }

    const dayParam = (req.query.day as string | undefined) ?? todayDateOnly();
    if (!isValidDateOnly(dayParam)) {
      return res.status(400).json({ error: "Invalid day format. Use YYYY-MM-DD" });
    }

    const row = await fetchIbadahDailyByStudentAndDay(student_id, dayParam);
    return res.json(row); // can be null
  } catch (err: any) {
    console.error("GET /ibadah/daily/:studentId error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

/**
 * ✅ POST /ibadah/tap
 * Body: { student_id: number, type: "salawat"|"adhkar"|"istighfar", day?: "YYYY-MM-DD", delta?: number }
 *
 * - Creates today's row if missing
 * - Increments the right counter
 */
router.post("/tap", async (req: Request, res: Response) => {
  try {
    const { student_id, type, day, delta } = req.body ?? {};

    const sid = Number(student_id);
    if (!Number.isFinite(sid)) {
      return res.status(400).json({ error: "student_id is required and must be a number" });
    }

    if (type !== "salawat" && type !== "adhkar" && type !== "istighfar") {
      return res.status(400).json({ error: 'type must be "salawat", "adhkar", or "istighfar"' });
    }

    const dayFinal = (day as string | undefined) ?? todayDateOnly();
    if (!isValidDateOnly(dayFinal)) {
      return res.status(400).json({ error: "Invalid day format. Use YYYY-MM-DD" });
    }

    const row = await tapIbadah({
      student_id: sid,
      type,
      day: dayFinal,
      delta: delta ?? 1,
    });

    return res.json(row);
  } catch (err: any) {
    console.error("POST /ibadah/tap error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

/**
 * ✅ GET /ibadah/totals?day=YYYY-MM-DD
 * If day is omitted => lifetime totals across all students.
 */
router.get("/totals", async (req: Request, res: Response) => {
  try {
    const day = req.query.day as string | undefined;

    if (day !== undefined && !isValidDateOnly(day)) {
      return res.status(400).json({ error: "Invalid day format. Use YYYY-MM-DD" });
    }

    const totals = await fetchTotals(day ? { day } : undefined);
    return res.json(totals);
  } catch (err: any) {
    console.error("GET /ibadah/totals error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

/**
 * Optional CRUD (handy for admin/testing)
 */

// GET /ibadah/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const row = await fetchIbadahDailyById(id);
    return res.json(row);
  } catch (err: any) {
    console.error("GET /ibadah/:id error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

// GET /ibadah (all rows)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchAllIbadahDailyRows();
    return res.json(rows);
  } catch (err: any) {
    console.error("GET /ibadah error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

// POST /ibadah (create row manually)
router.post("/", async (req: Request, res: Response) => {
  try {
    const created = await createIbadahDaily(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    console.error("POST /ibadah error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

// PATCH /ibadah/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const updated = await updateIbadahDaily(id, req.body);
    return res.json(updated);
  } catch (err: any) {
    console.error("PATCH /ibadah/:id error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

// DELETE /ibadah/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    await deleteIbadahDaily(id);
    return res.status(204).send();
  } catch (err: any) {
    console.error("DELETE /ibadah/:id error", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
});

export default router;
