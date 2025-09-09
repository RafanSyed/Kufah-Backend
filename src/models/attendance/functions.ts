import crypto from "crypto";
import AttendanceModel from "./models";
import { AttendanceRequest } from "./types";
import { populateAttendance, Attendance } from "./aggregations";
import { Op } from "sequelize";

/**
 * Add a new attendance row with generated token and expiry
 */
export const addAttendance = async (
  data: AttendanceRequest
): Promise<Attendance> => {
  const token = crypto.randomBytes(16).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const instance = await AttendanceModel.create({
    ...data,
    token,
    token_expires_at: tokenExpiresAt,
  } as any);

  return populateAttendance(instance.get({ plain: true }));
};

/**
 * Mark attendance by token
 */
export const markAttendanceByToken = async (
  token: string,
  status: "Absent" | "In Person" | "Online" | "Recording"
): Promise<Attendance> => {
  const record = await AttendanceModel.findOne({ where: { token } });
  if (!record) throw new Error("Invalid token");

  if (record.token_expires_at < new Date()) throw new Error("Token expired");

  await record.update({ status, updated_at: new Date() });
  return populateAttendance(record.get({ plain: true }));
};

export const fetchAttendanceByToken = async (token: string) => {
  if (!token) throw new Error("Token is required");

  const attendanceRows = await AttendanceModel.findAll({
    where: { token },
    order: [["created_at", "ASC"]], // optional: sort by creation time
  });

  if (!attendanceRows || attendanceRows.length === 0) {
    throw new Error("Attendance not found or invalid token");
  }

  return attendanceRows.map((row) => row.get({ plain: true }));
};

/**
 * Update attendance by ID
 */
export const updateAttendance = async (
  id: number,
  updates: Partial<AttendanceRequest>
): Promise<Attendance> => {
  const record = await AttendanceModel.findByPk(id);
  if (!record) throw new Error(`Attendance ${id} not found`);
  await record.update(updates);
  return populateAttendance(record.get({ plain: true }));
};

/**
 * Delete attendance by ID
 */
export const removeAttendance = async (id: number): Promise<void> => {
  const record = await AttendanceModel.findByPk(id);
  if (!record) throw new Error(`Attendance ${id} not found`);
  await record.destroy();
};

/**
 * Fetch all attendance by student
 */
export const fetchAttendanceByStudent = async (student_id: number): Promise<Attendance[]> => {
  const records = await AttendanceModel.findAll({ where: { student_id } });
  return records.map(r => populateAttendance(r.get({ plain: true })));
};

/**
 * Fetch all attendance by class
 */
export const fetchAttendanceByClass = async (class_id: number): Promise<Attendance[]> => {
  const records = await AttendanceModel.findAll({ where: { class_id } });
  return records.map(r => populateAttendance(r.get({ plain: true })));
};

/**
 * Fetch attendance by date
 */
export const fetchAttendanceByDate = async (date: Date): Promise<Attendance[]> => {
  const start = new Date(date); start.setHours(0,0,0,0);
  const end = new Date(date); end.setHours(23,59,59,999);

  const records = await AttendanceModel.findAll({
    where: { date: { [Op.between]: [start, end] } }
  });

  return records.map(r => populateAttendance(r.get({ plain: true })));
};

/**
 * Fetch attendance by student + class
 */
export const fetchAttendanceByStudentAndClass = async (
  student_id: number,
  class_id: number
): Promise<Attendance[]> => {
  const records = await AttendanceModel.findAll({ where: { student_id, class_id } });
  return records.map(r => populateAttendance(r.get({ plain: true })));
};

/**
 * Pre-create attendance for all classes of a student
 */
export const addAttendanceForStudentClasses = async (
  student_id: number,
  classes: number[]
): Promise<Attendance[]> => {
  const today = new Date();
  const promises = classes.map(class_id =>
    addAttendance({
      date: today,
      status: "Absent",
      student_id,
      class_id,
      token: "", // overridden
      token_expires_at: today,
      created_at: today,
      updated_at: today,
    })
  );
  return Promise.all(promises);
};

/**
 * Get attendance for student on a specific date
 */
export const getAttendanceForStudentByDate = async (
  student_id: number,
  date: Date,
  class_id?: number
): Promise<Attendance[]> => {
  const start = new Date(date); start.setHours(0,0,0,0);
  const end = new Date(date); end.setHours(23,59,59,999);

  const whereClause: any = { student_id, date: { [Op.between]: [start, end] } };
  if (class_id) whereClause.class_id = class_id;

  const records = await AttendanceModel.findAll({ where: whereClause });
  return records.map(r => populateAttendance(r.get({ plain: true })));
};

export const getAttendancesByLink = async (token: string): Promise<Attendance[]> => {
  if (!token) return [];

  // Find all attendance rows where email_link contains this token
  const records = await AttendanceModel.findAll({
    where: {
      email_link: {
        [Op.like]: `%${token}%`, // match any email_link that contains this token
      },
    },
  });

  return records.map(r => populateAttendance(r.get({ plain: true })));
};
