import { Router, Request, Response } from "express";
import {
  createTeacher,
  createMultipleTeachers,
  fetchTeacherByQuery,
  fetchAllTeachers,
  updateTeacher,
  deleteTeacher,
} from "../../../models/teachers/functions";
import { TeacherRequest } from "../../../models/teachers/types";

const router = Router();

/**
 * POST /api/teachers
 * Create a new teacher
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherData: TeacherRequest = req.body;

    // Basic validation
    if (!teacherData.firstName || !teacherData.lastName || !teacherData.email) {
      res.status(400).json({
        success: false,
        error: "First name, last name, and email are required",
      });
      return;
    }

    const teacher = await createTeacher(teacherData);

    res.status(201).json({
      success: true,
      data: teacher,
      message: "Teacher created successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/teachers
 * Fetch all teachers with optional filtering
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as Partial<TeacherRequest>;
    const teachers = await fetchAllTeachers(query);

    res.status(200).json({
      success: true,
      data: teachers,
      message: `Found ${teachers.length} teachers`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/teachers/:id
 * Fetch a single teacher by ID
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ success: false, error: "Missing teacher ID" });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid teacher ID" });
      return;
    }

    const teacher = await fetchTeacherByQuery({ id });

    res.status(200).json({
      success: true,
      data: teacher,
      message: "Teacher found",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/teachers/email/:email
 * Fetch a single teacher by email
 */
router.get("/email/:email", async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email;
    if (!email) {
      res.status(400).json({ success: false, error: "Email parameter is required" });
      return;
    }

    const teacher = await fetchTeacherByQuery({ email });

    res.status(200).json({
      success: true,
      data: teacher,
      message: "Teacher found",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/teachers/:id
 * Update a teacher by ID
 */
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({
        success: false,
        error: "Teacher ID parameter is required",
      });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid teacher ID" });
      return;
    }

    const updates: Partial<TeacherRequest> = req.body;
    const teacher = await updateTeacher(id, updates);

    res.status(200).json({
      success: true,
      data: teacher,
      message: "Teacher updated successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/teachers/:id
 * Delete a teacher by ID
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({
        success: false,
        error: "Teacher ID parameter is required",
      });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid teacher ID" });
      return;
    }

    await deleteTeacher(id);

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/teachers/bulk
 * Create multiple teachers at once
 */
router.post("/bulk", async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers: TeacherRequest[] = req.body.teachers;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      res.status(400).json({
        success: false,
        error: "Request body must include a non-empty 'teachers' array",
      });
      return;
    }

    console.log("Parsed teachers:", teachers);

    const createdTeachers = await createMultipleTeachers(teachers);

    res.status(201).json({
      success: true,
      data: createdTeachers,
      message: `${createdTeachers.length} teachers created successfully`,
    });
  } catch (error: any) {
    console.error("Bulk teacher creation error:", error);
    res.status(400).json({
      success: false,
      error: error.message || JSON.stringify(error),
    });
  }
});

export default router;