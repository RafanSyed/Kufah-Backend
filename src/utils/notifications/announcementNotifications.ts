// src/utils/notifications/announcementNotifications.ts
import { sendPushNotifications } from "./pushNotifications";
import StudentPushTokenModel from "../../models/studentPushTokens/models";
import StudentClassModel from "../../models/studentClasses/models";
import StudentModel from "../../models/students/models";
import ClassModel from "../../models/classes/models";
import { Op } from "sequelize";
import TeacherPushTokenModel from "../../models/teacherPushTokens/models";
import TeacherClassModel from "../../models/teacherClasses/models";

/**
 * Send notification when a class announcement is created
 */
export const sendAnnouncementNotification = async (announcement: {
  id: number;
  class_id: number | null;
  target_side: string | null;
  title: string;
  message: string;
}) => {
  try {
    console.log("[sendAnnouncementNotification] Sending for announcement:", announcement.id);

    // Case 1: All-student announcement (class_id is null)
    if (announcement.class_id === null) {
      console.log("[sendAnnouncementNotification] Sending to ALL students");

      // Get all active student push tokens
      const allTokens = await StudentPushTokenModel.findAll({
        where: { 
          student_id: { [Op.ne]: null },
          is_active: true 
        },
      });

      const tokens = allTokens.map((t) => t.get({ plain: true }).push_token);

      if (tokens.length === 0) {
        console.log("[sendAnnouncementNotification] No student tokens found");
        return;
      }

      await sendPushNotifications(
        tokens,
        "Kufah Announcement",
        `${announcement.title}: ${announcement.message.substring(0, 100)}${
          announcement.message.length > 100 ? "..." : ""
        }`,
        { type: "announcement", announcementId: announcement.id }
      );

      console.log(`[sendAnnouncementNotification] Sent to ${tokens.length} students`);
      return;
    }

    // Case 2: Class-specific announcement
    console.log("[sendAnnouncementNotification] Sending to class:", announcement.class_id);

    // Get the class name
    const classInfo = await ClassModel.findByPk(announcement.class_id);
    const className = classInfo ? classInfo.get({ plain: true }).name : "Class";

    // Get all students in this class
    const studentClasses = await StudentClassModel.findAll({
      where: { classId: announcement.class_id },
    });

    const studentIds = studentClasses.map((sc) => sc.get({ plain: true }).studentId);

    if (studentIds.length === 0) {
      console.log("[sendAnnouncementNotification] No students in class");
      return;
    }

    // Get student details to filter by side if needed
    const students = await StudentModel.findAll({
      where: { id: { [Op.in]: studentIds } },
    });

    // Filter by target_side if specified
    const filteredStudents = students.filter((s) => {
      const student = s.get({ plain: true });
      if (!announcement.target_side) return true; // No filter, send to all
      return student.side === announcement.target_side;
    });

    const filteredStudentIds = filteredStudents.map((s) => s.get({ plain: true }).id);

    console.log(
      `[sendAnnouncementNotification] Filtered students: ${filteredStudentIds.length}/${studentIds.length}`
    );

    if (filteredStudentIds.length === 0) {
      console.log("[sendAnnouncementNotification] No students after filtering");
      return;
    }

    // Get active push tokens for these students
    const tokens = await StudentPushTokenModel.findAll({
      where: { 
        student_id: { [Op.in]: filteredStudentIds },
        is_active: true 
      },
    });

    const pushTokens = tokens.map((t) => t.get({ plain: true }).push_token);

    if (pushTokens.length === 0) {
      console.log("[sendAnnouncementNotification] No push tokens found");
      return;
    }

    // 🆕 Use class name in notification title
    await sendPushNotifications(
      pushTokens,
      `${className} Announcement${announcement.target_side ? ` (${announcement.target_side})` : ""}`,
      `${announcement.title}: ${announcement.message.substring(0, 100)}${
        announcement.message.length > 100 ? "..." : ""
      }`,
      {
        type: "class_announcement",
        announcementId: announcement.id,
        classId: announcement.class_id,
      }
    );

    console.log(`[sendAnnouncementNotification] Sent to ${pushTokens.length} students`);
  } catch (err) {
    console.error("[sendAnnouncementNotification] Error:", err);
  }
};

/**
 * Send notification when a question is answered
 */
export const sendQuestionAnsweredNotification = async (question: {
  id: number;
  student_id: number;
  class_id: number;
  question: string;
  answer: string | null;
}) => {
  try {
    if (!question.answer) {
      console.log("[sendQuestionAnsweredNotification] No answer provided");
      return;
    }

    console.log("[sendQuestionAnsweredNotification] Sending for question:", question.id);

    // Get student's active push token
    const token = await StudentPushTokenModel.findOne({
      where: { 
        student_id: question.student_id,
        is_active: true 
      },
    });

    if (!token) {
      console.log("[sendQuestionAnsweredNotification] No active push token for student");
      return;
    }

    await sendPushNotifications(
      [token.get({ plain: true }).push_token],
      "Your Question Was Answered!",
      `Q: ${question.question.substring(0, 50)}${question.question.length > 50 ? "..." : ""}`,
      {
        type: "question_answered",
        questionId: question.id,
        classId: question.class_id,
      }
    );

    console.log("[sendQuestionAnsweredNotification] Notification sent");
  } catch (err) {
    console.error("[sendQuestionAnsweredNotification] Error:", err);
  }
};

/**
 * Send notification when a question is made public
 */
export const sendPublicQuestionNotification = async (question: {
  id: number;
  class_id: number;
  question: string;
  answer: string | null;
  student_id: number;
}) => {
  try {
    if (!question.answer) {
      console.log("[sendPublicQuestionNotification] No answer to share");
      return;
    }

    console.log("[sendPublicQuestionNotification] Sending for question:", question.id);

    // Get all students in this class EXCEPT the one who asked
    const studentClasses = await StudentClassModel.findAll({
      where: { classId: question.class_id },
    });

    const studentIds = studentClasses
      .map((sc) => sc.get({ plain: true }).studentId)
      .filter((id) => id !== question.student_id); // Exclude question asker

    if (studentIds.length === 0) {
      console.log("[sendPublicQuestionNotification] No other students in class");
      return;
    }

    // Get active push tokens
    const tokens = await StudentPushTokenModel.findAll({
      where: { 
        student_id: { [Op.in]: studentIds },
        is_active: true 
      },
    });

    const pushTokens = tokens.map((t) => t.get({ plain: true }).push_token);

    if (pushTokens.length === 0) {
      console.log("[sendPublicQuestionNotification] No push tokens found");
      return;
    }

    await sendPushNotifications(
      pushTokens,
      "New Public Q&A Posted",
      `Q: ${question.question.substring(0, 80)}${question.question.length > 80 ? "..." : ""}`,
      {
        type: "public_question",
        questionId: question.id,
        classId: question.class_id,
      }
    );

    console.log(`[sendPublicQuestionNotification] Sent to ${pushTokens.length} students`);
  } catch (err) {
    console.error("[sendPublicQuestionNotification] Error:", err);
  }
};

/**
 * Send notification to teacher when a student submits a question
 */
export const sendNewQuestionNotificationToTeacher = async (question: {
  id: number;
  student_id: number;
  class_id: number;
  question: string;
}) => {
  try {
    console.log("[sendNewQuestionNotificationToTeacher] Sending for question:", question.id);

    // Get the class name
    const classInfo = await ClassModel.findByPk(question.class_id);
    const className = classInfo ? classInfo.get({ plain: true }).name : "Class";

    // Get the student name
    const studentInfo = await StudentModel.findByPk(question.student_id);
    const studentName = studentInfo
      ? `${studentInfo.get({ plain: true }).firstName} ${studentInfo.get({ plain: true }).lastName}`
      : "A student";

    // Get teacher(s) for this class
    const teacherClasses = await TeacherClassModel.findAll({
      where: { classId: question.class_id },
    });

    const teacherIds = teacherClasses.map((tc) => tc.get({ plain: true }).teacherId);

    if (teacherIds.length === 0) {
      console.log("[sendNewQuestionNotificationToTeacher] No teachers found for class");
      return;
    }

    // Get active push tokens for these teachers
    const tokens = await TeacherPushTokenModel.findAll({
      where: {
        teacher_id: { [Op.in]: teacherIds },
        is_active: true,
      },
    });

    const pushTokens = tokens.map((t) => t.get({ plain: true }).push_token);

    if (pushTokens.length === 0) {
      console.log("[sendNewQuestionNotificationToTeacher] No push tokens found for teachers");
      return;
    }

    await sendPushNotifications(
      pushTokens,
      `New Question in ${className}`,
      `${studentName}: ${question.question.substring(0, 80)}${
        question.question.length > 80 ? "..." : ""
      }`,
      {
        type: "new_question",
        questionId: question.id,
        classId: question.class_id,
      }
    );

    console.log(`[sendNewQuestionNotificationToTeacher] Sent to ${pushTokens.length} teacher(s)`);
  } catch (err) {
    console.error("[sendNewQuestionNotificationToTeacher] Error:", err);
  }
};