import { addAttendance, getAttendanceForStudentByDate } from "../../models/attendance/functions";
import { sendAttendanceEmail } from "./sendAttendanceEmail";
import crypto from "crypto";
import axios, { AxiosInstance } from "axios";
import { toZonedTime, format } from "date-fns-tz";

const apiService: AxiosInstance = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

const ApiService = {
  async get(endpoint: string, params: Record<string, any> = {}) {
    const response = await apiService.get(endpoint, { params });
    return response.data;
  },
  async post(endpoint: string, data: Record<string, any> = {}) {
    const response = await apiService.post(endpoint, data);
    return response.data;
  },
  async put(endpoint: string, data: Record<string, any> = {}, config: Record<string, any> = {}) {
    const response = await apiService.put(endpoint, data, config);
    return response.data;
  },
};

interface ClassInfo {
  id: number;
  name: string;
  time: string;
  created_at: string;
  days: string[];
}

interface StudentByDay {
  studentId: number;
  classes: ClassInfo[];
}

interface StudentData {
  id: number;
  firstName: string;
  email: string;
}

// Helper function to parse time safely
const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const timeParts = timeString.split(":");
  const hours = parseInt(timeParts[0] || "0", 10) || 0;
  const minutes = parseInt(timeParts[1] || "0", 10) || 0;
  return { hours, minutes };
};

export const sendDailyAttendanceEmails = async () => {
  try {
    const timeZone = "America/New_York";
    const utcNow = new Date();
    const now = toZonedTime(utcNow, timeZone); // convert UTC → EST/EDT

    const day = format(now, "EEE", { timeZone }); // Sun, Mon, etc.

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const studentsByDay: StudentByDay[] = await ApiService.get(
      `/api/send-email/students-by-day/${day}`
    );

    if (!studentsByDay?.length) {
      console.log("⚠️ No students/classes found for today.");
      return;
    }

    for (const entry of studentsByDay) {
      const { studentId, classes } = entry;

      const studentDataResponse = await ApiService.get(`/api/students/${studentId}`);
      const studentData: StudentData | undefined = studentDataResponse?.data;

      if (!studentData?.id || !studentData.firstName || !studentData.email) continue;
      if (!classes?.length) continue;

      console.log(`🎓 Processing student: ${studentData.firstName} (${studentData.email})`);

      // Sort classes by time and get first class
      const sortedClasses: ClassInfo[] = classes
        .filter((c): c is ClassInfo => !!c.time)
        .sort((a, b) => {
          const aTime = parseTime(a.time);
          const bTime = parseTime(b.time);
          return aTime.hours * 60 + aTime.minutes - (bTime.hours * 60 + bTime.minutes);
        });

      const firstClass: ClassInfo | undefined = sortedClasses[0];
      if (!firstClass) continue;

      const firstClassTime = parseTime(firstClass.time);
      const scheduledDate = new Date(now);
      scheduledDate.setHours(firstClassTime.hours, firstClassTime.minutes, 0, 0);

      // Skip if current time is before scheduled class time
      if (now < scheduledDate) {
        console.log(`⏳ Waiting to send email for ${studentData.firstName}, first class at ${firstClass.time}`);
        continue;
      }

      // Check existing attendance
      const existingAttendance = (await getAttendanceForStudentByDate(studentData.id, now)) || [];
      let token: string;
      let emailLink: string;
      let emailSent = false;

      if (existingAttendance.length > 0) {
        token = existingAttendance[0]?.token ?? crypto.randomBytes(16).toString("hex");
        emailLink = existingAttendance[0]?.email_link ?? "";
        emailSent = true;
        console.log(`✅ Attendance already exists for ${studentData.firstName}`);
      } else {
        token = crypto.randomBytes(16).toString("hex");
        emailLink = `${frontendUrl}/pages/attendance?token=${token}`;
        console.log(`🆕 Creating attendance for ${studentData.firstName}`);
      }

      // Add attendance records for each class today
      for (const classInfo of sortedClasses) {
        const classAttendance = (await getAttendanceForStudentByDate(studentData.id, now, classInfo.id)) || [];
        if (classAttendance.length > 0) {
          console.log(`⏭️ Already has attendance for class ${classInfo.name}`);
          continue;
        }

        console.log(`➕ Adding attendance for ${classInfo.name} at ${classInfo.time}`);
        await addAttendance({
          date: now,
          status: "Absent",
          student_id: studentData.id,
          class_id: classInfo.id,
          token,
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          created_at: now,
          updated_at: now,
          email_link: emailLink,
        });
      }

      // Send email if not sent
      if (!emailSent) {
        await sendAttendanceEmail(studentData.email, studentData.firstName, token);
        console.log(`📧 Sent attendance email to ${studentData.firstName}`);
      }
    }
  } catch (err) {
    console.error("❌ Error sending attendance emails:", err);
  }
};
