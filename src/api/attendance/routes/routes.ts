import { Router, Request, Response } from "express";
import {
  addAttendance,
  updateAttendance,
  removeAttendance,
  fetchAttendanceByStudent,
  fetchAttendanceByClass,
  fetchAttendanceByDate,
  fetchAttendanceByStudentAndClass,
  markAttendanceByToken,
  fetchAttendanceByToken,
  getAttendancesByLink,
} from "../../../models/attendance/functions";
import { AttendanceRequest } from "../../../models/attendance/types";
import AttendanceModel from "../../../models/attendance/models";
import { Op } from "sequelize";

const router = Router();

// GET attendance by student
router.get("/student/:student_id", async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.student_id);
    if (isNaN(studentId)) return res.status(400).json({ message: "Invalid student ID" });

    const records = await fetchAttendanceByStudent(studentId);
    res.json(records);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// GET attendance by class
router.get("/class/:class_id", async (req: Request, res: Response) => {
  try {
    const classId = Number(req.params.class_id);
    if (isNaN(classId)) return res.status(400).json({ message: "Invalid class ID" });

    const records = await fetchAttendanceByClass(classId);
    res.json(records);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// PUT mark attendance by token
router.put(
  "/token/:token",
  async (
    req: Request<{ token: string }, {}, { status: "Absent" | "In Person" | "Online" | "Recording" }>,
    res: Response
  ) => {
    const token = req.params.token;
    if (!token) return res.status(400).json({ message: "Missing token" });

    try {
      const record = await markAttendanceByToken(token, req.body.status);
      res.json(record);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

// GET attendance by token
router.get("/token/:token", async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ message: "Missing token" });

  try {
    const attendanceRows = await fetchAttendanceByToken(token);

    // ✅ Type guard to ensure the array is not empty
    if (!attendanceRows || attendanceRows.length === 0) {
      return res.status(404).json({ message: "Attendance not found or invalid token" });
    }

    const firstRow = attendanceRows[0];
    if (!firstRow) {
      return res.status(404).json({ message: "Attendance not found or invalid token" });
    }

    res.json({
      student_id: firstRow.student_id, // safe to access now
      rows: attendanceRows,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});


// GET attendance by date
router.get("/date/:date", async (req: Request, res: Response) => {
  const dateParam = req.params.date;
  if (!dateParam) return res.status(400).json({ message: "Missing date" });

  const date = new Date(dateParam);
  if (isNaN(date.getTime())) return res.status(400).json({ message: "Invalid date format" });

  try {
    const records = await fetchAttendanceByDate(date);
    res.json(records);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// GET student/class
router.get("/student/:student_id/class/:class_id", async (req: Request, res: Response) => {
  const studentId = Number(req.params.student_id);
  const classId = Number(req.params.class_id);
  if (isNaN(studentId) || isNaN(classId))
    return res.status(400).json({ message: "Invalid student or class ID" });

  try {
    const records = await fetchAttendanceByStudentAndClass(studentId, classId);
    res.json(records);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// POST add attendance
router.post("/", async (req: Request<{}, {}, AttendanceRequest>, res: Response) => {
  try {
    const record = await addAttendance(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

// PUT update attendance
router.put("/:id", async (req: Request<{ id: string }, {}, Partial<AttendanceRequest>>, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid attendance ID" });

  try {
    const record = await updateAttendance(id, req.body);
    res.json(record);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// DELETE attendance
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid attendance ID" });

  try {
    await removeAttendance(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
});

// GET attendance by link token
router.get("/link/:tokenPart", async (req: Request<{ tokenPart: string }>, res: Response) => {
  const tokenPart = req.params.tokenPart;
  if (!tokenPart) return res.status(400).json({ message: "Missing tokenPart" });

  try {
    const rows = await AttendanceModel.findAll({
      where: {
        email_link: {
          [Op.like]: `%${tokenPart}%`,
        },
      },
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Attendance not found for this token" });
    }

    // TypeScript now knows rows[0] exists because of this check
    const firstRow = rows[0];
    if (!firstRow) {
      return res.status(404).json({ message: "Attendance not found for this token" });
    }

    res.json({
      student_id: firstRow.student_id,
      rows,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/email/:email_link", async (req: Request, res: Response) => {
  try {
    const { email_link } = req.params;

    if (!email_link) {
      return res.status(400).json({ message: "Missing email_link" });
    }

    const records = await getAttendancesByLink(email_link);

    if (!records.length) {
      return res.status(404).json({ message: "No attendance records found for this link" });
    }

    res.json({ records });
  } catch (err) {
    console.error("❌ Error fetching attendance by email_link:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
