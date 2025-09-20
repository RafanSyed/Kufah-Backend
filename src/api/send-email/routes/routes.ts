import { Router } from "express";
import AttendanceModel, { Attendance } from "../../../models/attendance/models"; // your Sequelize model
import { populateAttendance } from "../../../models/attendance/aggregations";
import { fetchStudentByQuery } from "../../../models/students/functions";
import { fetchClassesForStudent } from "../../../models/studentClasses/functions";
import { addAttendance, fetchAttendanceByStudent } from "../../../models/attendance/functions";
import { sendAttendanceEmail } from "../../../utils/email/sendAttendanceEmail";
import { fetchAllClasses } from "../../../models/classes/functions";
import { fetchStudentsInClass } from "../../../models/studentClasses/functions";

const router = Router();

/**
 * Fetch attendance rows by token.
 */
const fetchAttendanceByToken = async (token: string) => {
  const records = await AttendanceModel.findAll({ where: { token } });
  return records.map((r) => populateAttendance(r.get({ plain: true })));
};

router.post("/student/:student_id", async (req, res) => {
  try {
    const studentId = Number(req.params.student_id);
    const student = await fetchStudentByQuery({ id: studentId });
    const classes = await fetchClassesForStudent(studentId);

    for (const cls of classes) {
      const attendance = await addAttendance({
        date: new Date(),
        status: "Absent",
        student_id: studentId,
        class_id: cls.id,
        token: "", // addAttendance will generate it
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await sendAttendanceEmail(
        student.getEmail(),
        student.getFirstName(),
        attendance.token,
      );
    }

    console.log(`Sent attendance emails to ${student.getFirstName()} (${student.getEmail()})`);
    res.status(200).json({ message: "Attendance emails sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: (err as Error).message });
  }
});

router.get("/token/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const attendanceRows = await fetchAttendanceByToken(token);

    if (!attendanceRows || attendanceRows.length === 0) {
      return res.status(404).json({ message: "Attendance not found or invalid token" });
    }

    // ✅ Type guard for the first element
    const firstRow = attendanceRows[0];
    if (!firstRow) {
      return res.status(404).json({ message: "Attendance not found or invalid token" });
    }

    const studentId = firstRow.student_id;
    const student = await fetchStudentByQuery({ id: studentId });

    // Return only the fields you need
    const response = attendanceRows.map((att) => ({
      id: att.id,
      class_id: att.class_id,
      status: att.status,
    }));

    res.status(200).json({
      student_id: studentId,
      student_name: `${student.getFirstName()} ${student.getLastName()}`,
      attendance: response,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: (err as Error).message });
  }
});


router.get("/students-by-day/:day", async (req, res) => {
  try {
    const day = req.params.day;
    if (!day) return res.status(400).json({ error: "Day param required" });

    // 1️⃣ Fetch all classes and filter by the requested day (case-insensitive)
    const allClasses = await fetchAllClasses();
    console.log("📝 All classes with days:");
    allClasses.forEach((c) =>
      console.log(`Class ID ${c.id}: days = [${c.days.join(", ")}]`)
    );

    const todaysClasses = allClasses.filter((c) =>
      c.days.map((d) => d.trim().toLowerCase()).includes(day.toLowerCase())
    );

    // 2️⃣ Map students to their classes
    const studentMap: Record<number, any[]> = {};

    for (const cls of todaysClasses) {
      const studentsInClass = await fetchStudentsInClass(cls.id);

      studentsInClass.forEach((sc) => {
        (studentMap[sc.studentId] ??= []).push(cls);
      });

    }

    // 3️⃣ Transform into array and sort each student's classes by time
    const result = Object.entries(studentMap).map(([studentId, classObjs]) => ({
      studentId: Number(studentId),
      classes: classObjs
        .filter((c) => c.time) // make sure class has a time
        .sort((a, b) => {
          const [aH, aM] = a.time.split(":").map(Number);
          const [bH, bM] = b.time.split(":").map(Number);
          return aH * 60 + aM - (bH * 60 + bM);
        }),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/attendance/resend-email
 * Body: { classIds: number[], dryRun?: boolean }
 */
router.post("/resend-email", async (req, res) => {
  const { classIds, dryRun = false } = req.body;

  if (!Array.isArray(classIds) || classIds.length === 0) {
    return res.status(400).json({ message: "classIds[] is required" });
  }

  try {
    const studentMap = new Map<number, Attendance>();

    // 🔹 Collect latest attendance per student
    for (const classId of classIds) {
      const students = await fetchStudentsInClass(classId);

      for (const s of students) {
        const attendances = await fetchAttendanceByStudent(s.studentId);
        if (!attendances.length) continue;

        // Pick latest attendance row
        const latest = attendances.reduce((latest, current) =>
          new Date(current.date) > new Date(latest.date) ? current : latest
        );

        // Deduplicate: keep the newest per student
        const existing = studentMap.get(s.studentId);
        if (!existing || new Date(latest.date) > new Date(existing.date)) {
          studentMap.set(s.studentId, latest);
        }
      }
    }

    const results: any[] = [];

    // 🔹 Send emails once per student
    for (const [studentId, attendance] of studentMap.entries()) {
      try {
        const student = await fetchStudentByQuery({ id: studentId });
        if (!student.email || !attendance.email_link) {
          results.push({ studentId, sent: false, error: "Missing email or attendance link" });
          continue;
        }

        let token = "";
        try {
          token = new URL(attendance.email_link).searchParams.get("token") || "";
        } catch {
          results.push({ studentId, sent: false, error: "Invalid email_link format" });
          continue;
        }

        if (dryRun) {
          results.push({ studentId, email: student.email, token, willSend: true });
        } else {
          await sendAttendanceEmail(student.email, student.firstName, token);
          results.push({ studentId, email: student.email, sent: true });
        }
      } catch (err: any) {
        results.push({ studentId, sent: false, error: err.message });
      }
    }

    res.json({ success: true, total: results.length, dryRun, results });
  } catch (err: any) {
    console.error("❌ Error in resend-email:", err);
    res.status(500).json({ message: err.message });
  }
});


export default router;
