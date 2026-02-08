// src/backend/api/classes/routes/routes.ts
import { Router, Request, Response } from "express";
import {
  createClass,
  fetchClassById,
  updateClass,
  deleteClass,
  fetchAllClasses,
  fetchClassesToday
} from "../../../models/classes/functions";
import { ClassRequest } from "../../../models/classes/types";

const router = Router();

// GET all classes
router.get("/", async (_req: Request, res: Response) => {
  try {
    const classes = await fetchAllClasses();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.get("/today", async (_req: Request, res: Response) => {
  try {
    const classes = await fetchClassesToday();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET a class by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const cls = await fetchClassById(Number(req.params.id));
    res.json(cls);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// POST create a new class
router.post("/", async (req: Request<{}, {}, ClassRequest>, res: Response) => {
  try {
    const cls = await createClass(req.body);
    res.status(201).json(cls);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// PUT update class
router.put("/:id", async (req: Request<{ id: string }, {}, Partial<ClassRequest>>, res: Response) => {
  try {
    const cls = await updateClass(Number(req.params.id), req.body);
    res.json(cls);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// DELETE class
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteClass(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

export default router;
