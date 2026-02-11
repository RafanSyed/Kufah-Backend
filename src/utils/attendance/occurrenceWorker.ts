// src/utils/attendance/occurrenceWorker.ts

import { toZonedTime, format } from "date-fns-tz";

import ClassOccurrenceModel from "../../models/classOccurrences/models";
import {
  buildTodayClassOccurrences,
  fetchDueUnprocessedOccurrences,
  markOccurrenceProcessed,
} from "../../models/classOccurrences/functions";

import { addAttendance, getAttendanceForStudentByDate } from "../../models/attendance/functions";
import { ApiService } from "./internalApi";

// ✅ use YOUR push token functions
import {
  fetchActiveTokensForStudents,
  deactivatePushToken,
} from "../../models/studentPushTokens/functions";

// ✅ your Expo push sender
import { sendExpoPushToTokens } from "../push/expoPush";

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
  // join rows: [{ id, classId, studentId }, ...]
  const resp = await ApiService.get(`/api/student-classes/class/${classId}`);
  return resp?.data ?? resp;
};

const createAttendanceForOccurrence = async (opts: {
  classId: number;
  startsAt: Date;
  nowZoned: Date;
  students: any[];
}) => {
  const { classId, startsAt, nowZoned, students } = opts;

  let createdCount = 0;

  for (const s of students) {
    // join record -> studentId lives at s.studentId
    const studentId = Number(s?.studentId);
    if (!Number.isFinite(studentId)) continue;

    // prevents duplicates if worker re-runs inside window
    const existing = (await getAttendanceForStudentByDate(studentId, startsAt, classId)) || [];
    if (existing.length > 0) continue;

    await addAttendance({
      date: startsAt,
      status: "Absent",
      student_id: studentId,
      class_id: classId,
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
  console.log("🟢 Occurrence worker tick");

  try {
    const { nowZoned, isoDate } = getIsoDateNow();
    console.log("🕒 now:", nowZoned.toISOString(), "isoDate:", isoDate);
    // 1) noSchool check
    const blocked = await isNoSchoolToday(isoDate);
    console.log("🏫 noSchool blocked?", blocked);
    if (blocked) {
      console.log("🛑 Skipping occurrence worker run due to noSchool block");
      return;
    }

    // 2) ensure occurrences exist for today
    await ensureTodayOccurrencesExist(isoDate);

    // 3) fetch due occurrences
    const due = await fetchDueUnprocessedOccurrences(timeZone, DUE_WINDOW_MINUTES);
    console.log("📦 due occurrences:", due.length);
    if (!due.length){
      console.log("🟡 No due occurrences; exiting"); 
      return;
    };

    console.log(`⏰ Due occurrences: ${due.length}`);

    for (const occ of due) {
      const occurrenceId = occ.getId();
      const classId = occ.getClassId();
      const startsAt = occ.getStartsAt();

      console.log(
        `➡️ Processing occurrence=${occurrenceId} class_id=${classId} starts_at=${startsAt.toISOString()}`
      );

      // 4) fetch join rows for that class
      const students = await fetchStudentsForClass(classId);

      if (!Array.isArray(students) || students.length === 0) {
        console.log(`⚠️ No students for class_id=${classId}. Marking processed.`);
        await markOccurrenceProcessed(occurrenceId);
        continue;
      }

      // 5) create attendance rows
      const createdCount = await createAttendanceForOccurrence({
        classId,
        startsAt,
        nowZoned,
        students,
      });

      console.log(`✅ Created ${createdCount} attendance row(s) for class_id=${classId}`);

      // ============================================================
      // 🔔 PUSH NOTIFICATIONS (Expo)
      //
      // One notification per student per class occurrence.
      // We will send data so app can route to:
      // /(tabs)/student/class/[id].tsx  (classId)
      // ============================================================

      const studentIds = students
        .map((s: any) => Number(s?.studentId))
        .filter((n: number) => Number.isFinite(n));

      const tokenRows = await fetchActiveTokensForStudents(studentIds);
      const pushTokens = tokenRows
        .map((t: any) => t?.push_token) // StudentPushToken class property
        .filter((t: any) => typeof t === "string" && t.length > 0);

      if (!pushTokens.length) {
        console.log(`⚠️ No active push tokens for class_id=${classId}. Skipping push.`);
      } else {
        // Your expoPush.ts should already chunk + call Expo.
        // The "data" is what you'll read on notification tap in the app.
        const result = await sendExpoPushToTokens({
          tokens: pushTokens,
          title: "Complete your attendance",
          body: "Tap to open your class attendance.",
          data: {
            classId,
            occurrenceId,
            startsAt: startsAt.toISOString(),
          },
        });

        // OPTIONAL: if your sendExpoPushToTokens returns invalid tokens, deactivate them
        // (If your function does NOT return invalid tokens, you can remove this block.)
        if (result?.invalidTokens?.length) {
          for (const badToken of result.invalidTokens) {
            await deactivatePushToken(badToken);
          }
          console.log(`🧹 Deactivated ${result.invalidTokens.length} invalid token(s)`);
        }

        console.log(`✅ Sent push to ${pushTokens.length} device(s) for class_id=${classId}`);
      }

      // 6) mark occurrence processed so we don't notify again
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
