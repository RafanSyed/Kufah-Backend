// src/utils/notifications/ibadahReminders.ts
import { sendPushNotifications } from "./pushNotifications";
import StudentPushTokenModel from "../../models/studentPushTokens/models";
import StudentModel from "../../models/students/models";
import IbadahDailyModel from "../../models/ibadah/models";
import { Op } from "sequelize";

/**
 * Check and send Ibadah reminders for students who haven't completed today's goals
 * Should be run daily at 10 PM EST
 */
export const sendIbadahReminders = async () => {
  try {
    console.log("[sendIbadahReminders] Starting Ibadah reminder check...");

    // Get today's date in YYYY-MM-DD format (EST)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    const todayISO = `${year}-${month}-${day}`;
    console.log("[sendIbadahReminders] Today's date (EST):", todayISO);

    // Get all students who have ANY ibadah goals set (goals > 0)
    const studentsWithGoals = await StudentModel.findAll({
      where: {
        [Op.or]: [
          { salawat_goal_daily: { [Op.gt]: 0 } },
          { adhkar_goal_daily: { [Op.gt]: 0 } },
          { istighfar_goal_daily: { [Op.gt]: 0 } },
        ],
      },
    });

    if (studentsWithGoals.length === 0) {
      console.log("[sendIbadahReminders] No students with Ibadah goals found");
      return;
    }

    const studentIds = studentsWithGoals.map((s) => s.get({ plain: true }).id);
    console.log("[sendIbadahReminders] Students with goals:", studentIds.length);

    // Get today's progress for these students
    const todayProgress = await IbadahDailyModel.findAll({
      where: {
        student_id: { [Op.in]: studentIds },
        day: todayISO,
      },
    });

    // Map progress by student_id
    const progressByStudent = new Map<number, any>();
    todayProgress.forEach((prog) => {
      const plain = prog.get({ plain: true });
      progressByStudent.set(plain.student_id, plain);
    });

    // Find students who have incomplete goals
    const studentsWithIncompleteGoals: number[] = [];

    for (const student of studentsWithGoals) {
      const plain = student.get({ plain: true });
      const studentId = plain.id;
      
      const goals = {
        salawat: plain.salawat_goal_daily || 0,
        adhkar: plain.adhkar_goal_daily || 0,
        istighfar: plain.istighfar_goal_daily || 0,
      };

      const progress = progressByStudent.get(studentId);
      const done = {
        salawat: progress?.salawat_done || 0,
        adhkar: progress?.adhkar_done || 0,
        istighfar: progress?.istighfar_done || 0,
      };

      // Check if any goal is incomplete
      const hasIncompleteGoals =
        (goals.salawat > 0 && done.salawat < goals.salawat) ||
        (goals.adhkar > 0 && done.adhkar < goals.adhkar) ||
        (goals.istighfar > 0 && done.istighfar < goals.istighfar);

      if (hasIncompleteGoals) {
        studentsWithIncompleteGoals.push(studentId);
      }
    }

    console.log(
      "[sendIbadahReminders] Students with incomplete goals:",
      studentsWithIncompleteGoals.length
    );

    if (studentsWithIncompleteGoals.length === 0) {
      console.log("[sendIbadahReminders] All students have completed their goals! 🎉");
      return;
    }

    // Get active push tokens for these students
    const tokens = await StudentPushTokenModel.findAll({
      where: {
        student_id: { [Op.in]: studentsWithIncompleteGoals },
        is_active: true,
      },
    });

    const pushTokens = tokens.map((t) => t.get({ plain: true }).push_token);

    if (pushTokens.length === 0) {
      console.log("[sendIbadahReminders] No push tokens found for students");
      return;
    }

    // Send reminders
    await sendPushNotifications(
      pushTokens,
      "Ibadah Reminder 🌙",
      "Don't forget to complete your Ibadah goals for today before you sleep!",
      { type: "ibadah_reminder" }
    );

    console.log(`[sendIbadahReminders] Sent reminders to ${pushTokens.length} students`);
  } catch (err) {
    console.error("[sendIbadahReminders] Error:", err);
  }
};

/**
 * Schedule Ibadah reminders to run daily at 10 PM EST
 * Call this once when the server starts
 */
export const scheduleIbadahReminders = () => {
  const checkAndSchedule = () => {
    const now = new Date();

    // Get current time in EST
    const estTime = new Date(
      now.toLocaleString("en-US", {
        timeZone: "America/New_York",
      })
    );

    const targetHour = 22; // 10 PM
    const targetMinute = 0;

    // Calculate next run time
    const nextRun = new Date(estTime);
    nextRun.setHours(targetHour, targetMinute, 0, 0);

    // If we've passed today's target time, schedule for tomorrow
    if (estTime >= nextRun) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const msUntilNext = nextRun.getTime() - estTime.getTime();

    console.log(
      `[scheduleIbadahReminders] Next reminder scheduled for: ${nextRun.toLocaleString("en-US", {
        timeZone: "America/New_York",
      })} EST (in ${Math.round(msUntilNext / 1000 / 60)} minutes)`
    );

    setTimeout(async () => {
      await sendIbadahReminders();
      // Schedule next day
      checkAndSchedule();
    }, msUntilNext);
  };

  checkAndSchedule();
};