import { addAttendance, getAttendanceForStudentByDate } from "../../models/attendance/functions";
import { sendAttendanceEmail } from "./sendAttendanceEmail";
import crypto from "crypto";

import axios, { AxiosInstance } from "axios";

// ---------- ApiService ----------
const apiService: AxiosInstance = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

const ApiService = {
  async get(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await apiService.get(endpoint, { params });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("GET Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("GET unexpected error:", err);
        throw err;
      }
    }
  },

  async post(endpoint: string, data: Record<string, any> = {}) {
    try {
      const response = await apiService.post(endpoint, data);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("POST Axios error:", err.response?.data || err.message);
        throw err;
      } else {
        console.error("POST unexpected error:", err);
        throw err;
      }
    }
  },

  async put(endpoint: string, data: Record<string, any> = {}, config: Record<string, any> = {}) {
    try {
      const response = await apiService.put(endpoint, data, config);
      return response.data;
    } catch (err: unknown) {
      throw err;
    }
  },
};

// ---------- Types ----------
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

// ---------- Main Function ----------
export const sendDailyAttendanceEmails = async () => {
  try {
    const now = new Date();
    console.log(`⏰ Current time: ${now.toLocaleString()}`);

    const day = now.toLocaleString("en-US", { weekday: "short" });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    console.log(`⏰ Checking for upcoming classes to send attendance emails for ${day}...`);

    const studentsByDay: StudentByDay[] = await ApiService.get(`/api/send-email/students-by-day/${day}`);

    if (!studentsByDay?.length) {
      console.warn("⚠️ No students/classes found for today.");
      return false;
    }

    for (const entry of studentsByDay) {
      const { studentId, classes } = entry;

      // 2️⃣ Get full student info
      const studentDataResponse = await ApiService.get(`/api/students/${studentId}`);
      const studentData: StudentData = studentDataResponse?.data;
      if (!studentData?.id || !studentData.firstName || !studentData.email) {
        console.warn(`⚠️ Student not found or invalid data for ID ${studentId}`, studentData);
        continue;
      }

      if (!classes?.length) continue;

      // 3️⃣ Sort classes by time
      const sortedClasses = classes
        .filter((c): c is ClassInfo => !!c.time)
        .sort((a, b) => {
          const [aH, aM] = a.time.split(":").map(Number);
          const [bH, bM] = b.time.split(":").map(Number);
          return (aH ?? 0) * 60 + (aM ?? 0) - ((bH ?? 0) * 60 + (bM ?? 0));
        });

      if (!sortedClasses.length) continue;

      // 4️⃣ Determine first class time for scheduling email
      const firstClass = sortedClasses[0];
      if (!firstClass?.time) continue; // safety check

      const [h, m] = firstClass.time.split(":").map(Number);
      const firstClassDate = new Date(now);
      firstClassDate.setHours(h ?? 0, m ?? 0, 0, 0);

      const scheduledSendTime = new Date(firstClassDate.getTime() - 5 * 60 * 1000);
      console.log(`📅 Scheduled email send time for ${studentData.firstName}: ${scheduledSendTime.toLocaleString()}`);

      if (now < scheduledSendTime) {
        console.log(`⏳ Too early to send email for ${studentData.firstName}, skipping for now`);
        continue;
      }

      // 5️⃣ Generate or reuse token/email link
      let token: string;
      let emailLink: string;
      let emailSent = false;

      const existingAttendance = await getAttendanceForStudentByDate(studentData.id, now);
      const firstAttendance = existingAttendance[0];

      if (firstAttendance) {
        token = firstAttendance.token;
        emailLink = firstAttendance.email_link ?? "";
        emailSent = true;
        console.log(`🔗 Reusing existing email link for ${studentData.firstName}`);
      } else {
        token = crypto.randomBytes(16).toString("hex");
        emailLink = `${frontendUrl}/attendance?token=${token}`;
      }

      // 6️⃣ Loop through sorted classes and create attendance rows
      for (const classInfo of sortedClasses) {
        const classAttendance = await getAttendanceForStudentByDate(studentData.id, now, classInfo.id);
        if (classAttendance.length > 0) continue;

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

        console.log(`✅ Attendance row created for ${studentData.firstName} for class ID ${classInfo.id}`);
      }

      // 7️⃣ Send email once
      if (!emailSent) {
        await sendAttendanceEmail(studentData.email, studentData.firstName, token);
        console.log(`📧 Sent attendance email to ${studentData.firstName} (${studentData.email})`);
      }
    }
    return true;
  } catch (err) {
    console.error("❌ Error sending attendance emails:", err);
    return true;
  }
};
