// src/utils/attendance/occurrenceWorker.ts
import crypto from "crypto";
import { toZonedTime, format } from "date-fns-tz";

import ClassOccurrenceModel from "../../models/classOccurrences/models";
import {
  buildTodayClassOccurrences,
  fetchDueUnprocessedOccurrences,
  markOccurrenceProcessed,
} from "../../models/classOccurrences/functions";

import { addAttendance, getAttendanceForStudentByDate } from "../../models/attendance/functions";
import { ApiService } from "./internalApi";

const timeZone = "America/New_York";

// testing window: don’t miss stuff while you’re debugging
const DUE_WINDOW_MINUTES = Number(process.env.OCCURRENCE_WINDOW_MINUTES || 10);

// avoid overlap
let isWorkerRunning = false;

// throttle (optional)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getIsoDateNow = () => {
  const nowZoned = toZonedTime(new Date(), timeZone);
  const isoDate = format(nowZoned, "yyyy-MM-dd", { timeZone });
  return { nowZoned, isoDate };
};

const isNoSchoolToday = async (isoDate: string): Promise<boolean> => {
  try {
    const statusResp = await ApiService.get(`/api/noSchool/check/${isoDate}`);
    const status = statusResp?.data ?? statusResp;
    return Boolean(status?.blocked);
  } catch (e) {
    // safety default: do nothing if noSchool check fails
    console.error("❌ Failed noSchool check. Skipping worker as safety.", e);
    return true;
  }
};

const ensureTodayOccurrencesExist = async (isoDate: string) => {
  const hasAnyToday = await ClassOccurrenceModel.findOne({ where: { date: isoDate } });
  if (!hasAnyToday) {
    console.log(`🆕 No occurrences found for ${isoDate}. Building...`);
    const rows = await buildTodayClassOccurrences(timeZone);
    console.log(`✅ Built/confirmed ${rows.length} occurrence(s) for today`);
  }
};

const fetchStudentsForClass = async (classId: number) => {
  const resp = await ApiService.get(`/api/student-classes/class/${classId}`);
  const students = resp?.data ?? resp;
  return students;
};

const createAttendanceForOccurrence = async (opts: {
  classId: number;
  startsAt: Date;
  nowZoned: Date;
  isoDate: string;
  students: any[];
}) => {
  const { classId, startsAt, nowZoned, students } = opts;

  // ⚠️ TEMP (email-era fields):
  // You’re still generating token/link/email flags because your attendance schema currently expects them.
  // Later, when you fully switch to push notifications, you can:
  // - remove token/email_link/email_sent columns (or stop writing them)
  // - change attendance marking to be by (student_id, class_id, date) instead of token
  const token = crypto.randomBytes(16).toString("hex");
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const link = `${frontendUrl}/pages/attendance?token=${token}`;

  let createdCount = 0;

  for (const s of students) {
    // student-classes endpoint returns join records, so student id is s.studentId (not s.id)
    const studentId = Number(s?.studentId);
    if (!Number.isFinite(studentId)) continue;

    // prevents duplicate rows if worker runs twice within the window
    const existing = (await getAttendanceForStudentByDate(studentId, startsAt, classId)) || [];
    if (existing.length > 0) continue;

    await addAttendance({
      date: startsAt,
      status: "Absent",
      student_id: studentId,
      class_id: classId,

      // keep until you fully remove email flow columns
      token,
      token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      email_link: link,
      email_sent: false,

      created_at: nowZoned,
      updated_at: nowZoned,
    } as any);

    createdCount++;
  }

  return createdCount;
};

export const runOccurrenceWorker = async () => {
  if (isWorkerRunning) {
    console.log("⚠️ Skipping occurrence worker, previous run still active");
    return;
  }

  isWorkerRunning = true;

  try {
    const { nowZoned, isoDate } = getIsoDateNow();

    // 1) noSchool check
    const blocked = await isNoSchoolToday(isoDate);
    if (blocked) return;

    // 2) ensure occurrences exist for today
    await ensureTodayOccurrencesExist(isoDate);

    // 3) fetch due occurrences (classes whose starts_at is within the window and not processed)
    const due = await fetchDueUnprocessedOccurrences(timeZone, DUE_WINDOW_MINUTES);
    if (!due.length) return;

    console.log(`⏰ Due occurrences: ${due.length}`);

    for (const occ of due) {
      const occurrenceId = occ.getId();
      const classId = occ.getClassId();
      const startsAt = occ.getStartsAt();

      console.log(
        `➡️ Processing occurrence=${occurrenceId} class_id=${classId} starts_at=${startsAt.toISOString()}`
      );

      // 4) fetch student list (join rows) for that class
      const students = await fetchStudentsForClass(classId);

      if (!Array.isArray(students) || students.length === 0) {
        console.log(`⚠️ No students for class_id=${classId}. Marking processed.`);
        await markOccurrenceProcessed(occurrenceId);
        continue;
      }

      // 5) create attendance rows (one per student for this class occurrence)
      const createdCount = await createAttendanceForOccurrence({
        classId,
        startsAt,
        nowZoned,
        isoDate,
        students,
      });

      console.log(`✅ Created ${createdCount} attendance row(s) for class_id=${classId}`);

      // ============================================================
      // 🔔 PUSH NOTIFICATIONS WORK STARTS HERE (NEXT STEP)
      //
      // Goal: send ONE push notification per student per class occurrence,
      // at the time of the class (which is why we're inside the "due occurrence" loop).
      //
      // What you will implement here:
      //
      // (A) You need each student to have a saved Expo push token.
      //     - When the student logs into the Expo app, the app asks permission,
      //       gets expoPushToken, and sends it to your backend.
      //     - Backend stores token in DB (recommended: a StudentPushTokens table
      //       that supports multiple devices per student).
      //
      // (B) Fetch push tokens for the students in THIS class:
      //     - Either:
      //         1) call an endpoint like GET /api/push-tokens/student/:studentId
      //         2) or join in DB directly in a helper function
      //
      // (C) Send notifications:
      //     - Use Expo push API (https://exp.host/--/api/v2/push/send)
      //     - Batch in chunks (Expo limit ~100 messages per request)
      //     - Handle invalid tokens (DeviceNotRegistered) and delete them
      //
      // (D) Optional but recommended: record "notification_sent_at"
      //     - Either in class_occurrences (e.g. notified_at) or a separate table
      //       like class_occurrence_notifications to avoid double-sending.
      //
      // Pseudocode (you'll implement soon):
      //
      //   const studentIds = students.map(s => Number(s.studentId)).filter(Number.isFinite);
      //   const tokens = await fetchPushTokensForStudents(studentIds);
      //   await sendPushBatch(tokens, {
      //     title: "Time to mark attendance",
      //     body: `Your class is starting now.`,
      //     data: { classId, occurrenceId, startsAt: startsAt.toISOString() }
      //   });
      //
      // For now, you're mimicking with emails — this is the exact slot you'll swap out.
      // ============================================================

      // 6) mark occurrence processed so we don't create attendance / notify again
      await markOccurrenceProcessed(occurrenceId);
      console.log(`✅ Marked occurrence ${occurrenceId} processed`);

      await sleep(150);
    }
  } catch (err) {
    console.error("❌ Occurrence worker error:", err);
  } finally {
    isWorkerRunning = false;
  }
};
