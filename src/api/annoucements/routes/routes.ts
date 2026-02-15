// src/backend/api/announcements/routes.ts
import { Router, Request, Response } from "express";
import {
  createAnnouncement,
  getAnnouncementById,
  getAllAnnouncements,
  getAnnouncementsForStudent,
  getAnnouncementsByClass,
  getAnnouncementsByTeacher,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../../models/annoucements/functions";
import { AnnouncementRequest } from "../../../models/annoucements/types";
import { fetchStudentByQuery } from "../../../models/students/functions";

const router = Router();

// ------------------- GET all announcements -------------------
// GET /api/announcements?teacher_id=123&class_id=456&limit=50
router.get("/", async (req: Request, res: Response) => {
  try {
    const teacher_id = req.query.teacher_id ? Number(req.query.teacher_id) : undefined;
    const class_id_param = req.query.class_id;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    // Handle class_id: undefined means don't filter, "null" string means filter for null
    let class_id: number | null | undefined = undefined;
    if (class_id_param === "null") {
      class_id = null;
    } else if (class_id_param) {
      class_id = Number(class_id_param);
    }

    // Build filters object without undefined values
    const filters: {
      teacher_id?: number;
      class_id?: number | null;
      limit?: number;
    } = {};
    
    if (teacher_id !== undefined) filters.teacher_id = teacher_id;
    if (class_id !== undefined) filters.class_id = class_id;
    if (limit !== undefined) filters.limit = limit;

    const announcements = await getAllAnnouncements(filters);

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET announcements for a student -------------------
// GET /api/announcements/student/123
router.get("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    if (!Number.isFinite(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Get student's side using fetchStudentByQuery
    const student = await fetchStudentByQuery({ id: studentId });
    
    if (!student?.side) {
      return res.status(400).json({ message: "Student side not found" });
    }

    const announcements = await getAnnouncementsForStudent(studentId, student.side);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET announcements for a class -------------------
// GET /api/announcements/class/123
router.get("/class/:classId", async (req: Request, res: Response) => {
  try {
    const classId = Number(req.params.classId);
    if (!Number.isFinite(classId)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const announcements = await getAnnouncementsByClass(classId);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- GET announcements by teacher -------------------
// GET /api/announcements/teacher/123
router.get("/teacher/:teacherId", async (req: Request, res: Response) => {
  try {
    const teacherId = Number(req.params.teacherId);
    if (!Number.isFinite(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    const announcements = await getAnnouncementsByTeacher(teacherId);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ------------------- POST create announcement -------------------
router.post("/", async (req: Request<{}, {}, Partial<AnnouncementRequest>>, res: Response) => {
  try {
    const { teacher_id, class_id, target_side, title, message } = req.body;

    if (!teacher_id) {
      return res.status(400).json({ message: "teacher_id is required" });
    }
    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    // Validate target_side if provided
    if (target_side && !["brothers", "sisters"].includes(target_side)) {
      return res.status(400).json({ 
        message: "target_side must be 'brothers' or 'sisters'" 
      });
    }

    const announcement = await createAnnouncement({
      teacher_id: Number(teacher_id),
      class_id: class_id ? Number(class_id) : null,
      target_side: target_side || null,
      title,
      message,
    });

    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// ------------------- GET by ID -------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const announcement = await getAnnouncementById(id);
    res.json(announcement);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// ------------------- PUT update -------------------
router.put("/:id", async (req: Request<{ id: string }, {}, Partial<AnnouncementRequest>>, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { title, message, target_side, class_id } = req.body;
    
    // Validate target_side if provided
    if (target_side !== undefined && target_side !== null && !["brothers", "sisters"].includes(target_side)) {
      return res.status(400).json({ 
        message: "target_side must be 'brothers' or 'sisters'" 
      });
    }

    // Build updates object without undefined values
    const updates: Partial<AnnouncementRequest> = {};
    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (target_side !== undefined) updates.target_side = target_side;
    if (class_id !== undefined) updates.class_id = class_id;

    const announcement = await updateAnnouncement(id, updates);

    res.json(announcement);
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

    await deleteAnnouncement(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

export default router;