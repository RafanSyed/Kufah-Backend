// src/backend/api/studentClasses/routes/routes.ts
import { Router, Request, Response } from "express";
import {
  addStudentToClass,
  removeStudentFromClass,
  fetchStudentsInClass,
  fetchClassesForStudent,
  addStudentsToClass,
  addClassesToStudent,
  updateClassesForStudent,
} from "../../../models/studentClasses/functions";
import { StudentClassRequest, BulkStudentClassRequest } from "../../../models/studentClasses/types";

const router = Router();

// GET all students in a specific class
router.get("/class/:classId", async (req: Request, res: Response) => {
  try {
    const classId = Number(req.params.classId);
    const students = await fetchStudentsInClass(classId);
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET all classes for a specific student
router.get("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    const classes = await fetchClassesForStudent(studentId);
    res.json(classes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST: add student to class
router.post("/", async (req: Request<{}, {}, StudentClassRequest>, res: Response) => {
  try {
    const studentClass = await addStudentToClass(req.body);
    res.status(201).json(studentClass);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});



// DELETE: remove student from class
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await removeStudentFromClass(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk", async (req: Request<{}, {}, BulkStudentClassRequest>, res: Response) => {
  try {
    const studentClasses = await addStudentsToClass(req.body);
    res.status(201).json(studentClasses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/student/bulk", async (req: Request, res: Response) => {
  try {
    const { studentId, classIds } = req.body;

    if (!studentId || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "studentId and classIds[] are required" });
    }

    const studentClasses = await addClassesToStudent(studentId, classIds);
    res.status(201).json(studentClasses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: replace all classes for a student
router.put("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    const { classIds } = req.body;

    if (!studentId || !Array.isArray(classIds)) {
      return res
        .status(400)
        .json({ message: "studentId and classIds[] are required" });
    }

    const updatedClasses = await updateClassesForStudent(studentId, classIds);
    res.status(200).json(updatedClasses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
