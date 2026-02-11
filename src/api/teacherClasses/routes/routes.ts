import { Router, Request, Response } from "express";
import {
  addTeacherToClass,
  addTeachersToClass,
  removeTeacherFromClass,
  fetchTeachersInClass,
  fetchClassesForTeacher,
  addClassesToTeacher,
  updateClassesForTeacher,
} from "../../../models/teacherClasses/functions";
import { TeacherClassRequest, BulkTeacherClassRequest } from "../../../models/teacherClasses/types";

const router = Router();

/**
 * POST /api/teacherClasses
 * Add one teacher to one class
 * body: { teacherId, classId }
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const data: TeacherClassRequest = req.body;

    if (!data.teacherId || !data.classId) {
      res.status(400).json({
        success: false,
        error: "teacherId and classId are required",
      });
      return;
    }

    const created = await addTeacherToClass(data);

    res.status(201).json({
      success: true,
      data: created,
      message: "Teacher added to class successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/teacherClasses/bulk
 * Add many teachers to ONE class
 * body: { classId, teacherIds: number[] }
 */
router.post("/bulk", async (req: Request, res: Response): Promise<void> => {
  try {
    const data: BulkTeacherClassRequest = req.body;

    if (!data.classId || !Array.isArray(data.teacherIds) || data.teacherIds.length === 0) {
      res.status(400).json({
        success: false,
        error: "classId and a non-empty teacherIds array are required",
      });
      return;
    }

    const created = await addTeachersToClass(data);

    res.status(201).json({
      success: true,
      data: created,
      message: `${created.length} teacher-class records created successfully`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/teacherClasses/class/:classId
 * Fetch all teachers assigned to a class
 */
router.get("/class/:classId", async (req: Request, res: Response): Promise<void> => {
  try {
    const classIdParam = req.params.classId;
    if (!classIdParam) {
      res.status(400).json({ success: false, error: "Missing classId parameter" });
      return;
    }

    const classId = parseInt(classIdParam);
    if (isNaN(classId)) {
      res.status(400).json({ success: false, error: "Invalid classId" });
      return;
    }

    const records = await fetchTeachersInClass(classId);

    res.status(200).json({
      success: true,
      data: records,
      message: `Found ${records.length} teachers in class ${classId}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/teacherClasses/teacher/:teacherId
 * Fetch all classes assigned to a teacher
 */
router.get("/teacher/:teacherId", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherIdParam = req.params.teacherId;
    if (!teacherIdParam) {
      res.status(400).json({ success: false, error: "Missing teacherId parameter" });
      return;
    }

    const teacherId = parseInt(teacherIdParam);
    if (isNaN(teacherId)) {
      res.status(400).json({ success: false, error: "Invalid teacherId" });
      return;
    }

    const records = await fetchClassesForTeacher(teacherId);

    res.status(200).json({
      success: true,
      data: records,
      message: `Found ${records.length} classes for teacher ${teacherId}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/teacherClasses/teacher/:teacherId/classes
 * Add multiple classes to a teacher (append)
 * body: { classIds: number[] }
 */
router.post("/teacher/:teacherId/classes", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherIdParam = req.params.teacherId;
    if (!teacherIdParam) {
      res.status(400).json({ success: false, error: "Missing teacherId parameter" });
      return;
    }

    const teacherId = parseInt(teacherIdParam);
    if (isNaN(teacherId)) {
      res.status(400).json({ success: false, error: "Invalid teacherId" });
      return;
    }

    const classIds: number[] = req.body?.classIds;

    if (!Array.isArray(classIds) || classIds.length === 0) {
      res.status(400).json({
        success: false,
        error: "Request body must include a non-empty classIds array",
      });
      return;
    }

    const created = await addClassesToTeacher(teacherId, classIds);

    res.status(201).json({
      success: true,
      data: created,
      message: `Added ${created.length} classes to teacher ${teacherId}`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/teacherClasses/teacher/:teacherId/classes
 * Replace all classes for a teacher
 * body: { classIds: number[] }
 */
router.put("/teacher/:teacherId/classes", async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherIdParam = req.params.teacherId;
    if (!teacherIdParam) {
      res.status(400).json({ success: false, error: "Missing teacherId parameter" });
      return;
    }

    const teacherId = parseInt(teacherIdParam);
    if (isNaN(teacherId)) {
      res.status(400).json({ success: false, error: "Invalid teacherId" });
      return;
    }

    const classIds: number[] = req.body?.classIds;

    if (!Array.isArray(classIds)) {
      res.status(400).json({
        success: false,
        error: "Request body must include classIds array (can be empty)",
      });
      return;
    }

    const updated = await updateClassesForTeacher(teacherId, classIds);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Updated classes for teacher ${teacherId}`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/teacherClasses/:id
 * Remove a teacher-class assignment by record ID
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ success: false, error: "Missing id parameter" });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid id" });
      return;
    }

    await removeTeacherFromClass(id);

    res.status(200).json({
      success: true,
      message: "Teacher removed from class successfully",
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;