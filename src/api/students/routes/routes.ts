import { Router, Request, Response } from "express";
import { 
  createStudent, 
  fetchStudentByQuery, 
  fetchAllStudents, 
  updateStudent, 
  deleteStudent 
} from "../../../models/students/functions";
import { StudentRequest, Student } from "../../../models/students/types";

const router = Router();

/**
 * POST /api/students
 * Create a new student
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const studentData: StudentRequest = req.body;
    
    // Basic validation
    if (!studentData.firstName || !studentData.lastName || !studentData.email) {
      res.status(400).json({
        success: false,
        error: "First name, last name, and email are required"
      });
      return;
    }

    const student = await createStudent(studentData);
    
    res.status(201).json({
      success: true,
      data: student,
      message: "Student created successfully"
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/students
 * Fetch all students with optional filtering
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query as Partial<StudentRequest>;
    const students = await fetchAllStudents(query);
    console.log("Fetched students:", students);
    res.status(200).json({
      success: true,
      data: students,
      message: `Found ${students.length} students`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/students/:id
 * Fetch a single student by ID
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ success: false, error: "Missing student ID" });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid student ID" });
      return;
    }

    const student = await fetchStudentByQuery({ id });
    res.status(200).json({ success: true, data: student, message: "Student found" });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
});


/**
 * GET /api/students/email/:email
 * Fetch a single student by email
 */
router.get("/email/:email", async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email;
    if (!email) {
      res.status(400).json({ success: false, error: "Email parameter is required" });
      return;
    }

    const student = await fetchStudentByQuery({ email });
    
    res.status(200).json({
      success: true,
      data: student,
      message: "Student found"
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/students/:id
 * Update a student by ID
 */
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ success: false, error: "Student ID parameter is required" });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid student ID" });
      return;
    }

    const updates: Partial<StudentRequest> = req.body;
    const student = await updateStudent(id, updates);

    res.status(200).json({
      success: true,
      data: student,
      message: "Student updated successfully"
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * DELETE /api/students/:id
 * Delete a student by ID
 */
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      res.status(400).json({ success: false, error: "Student ID parameter is required" });
      return;
    }

    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid student ID" });
      return;
    }

    await deleteStudent(id);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

export default router;