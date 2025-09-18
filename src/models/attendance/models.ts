import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";
import { validateStudent, validateClass } from "../validation";

// Attributes interface
export interface AttendanceAttributes {
  id: number;
  date: Date;
  status: "Absent" | "In Person" | "Online" | "Recording";
  token: string;
  token_expires_at: Date;
  created_at: Date;
  updated_at: Date;
  student_id: number;
  class_id: number;
  email_link?: string;
  email_sent?: boolean;  // now persisted in DB
}

// Sequelize model
class AttendanceModel extends Model<AttendanceAttributes> implements AttendanceAttributes {
  public id!: number;
  public date!: Date;
  public status!: "Absent" | "In Person" | "Online" | "Recording";
  public token!: string;
  public token_expires_at!: Date;
  public created_at!: Date;
  public updated_at!: Date;
  public student_id!: number;
  public class_id!: number;
  public email_link?: string;
  public email_sent?: boolean; // DB field, not just virtual
}

AttendanceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    date: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("Absent", "In Person", "Online", "Recording"),
      allowNull: false,
    },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    token_expires_at: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { async isValidStudent(value: number) { await validateStudent(value); } },
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { async isValidClass(value: number) { await validateClass(value); } },
    },
    email_link: { type: DataTypes.STRING, allowNull: true },
    email_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,          // allows legacy rows
      defaultValue: false,      // new rows = not sent yet
    },
  },
  {
    sequelize: CORE_DB,
    tableName: "attendance",
    modelName: "attendance",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["student_id", "class_id", "date"] },
    ],
  }
);

// Type-safe class for returning data
export class Attendance {
  constructor(
    public id: number,
    public date: Date,
    public status: "Absent" | "In Person" | "Online" | "Recording",
    public token: string,
    public token_expires_at: Date,
    public created_at: Date,
    public updated_at: Date,
    public student_id: number,
    public class_id: number,
    public email_link?: string,
    public email_sent: boolean = false
  ) {}
}

export default AttendanceModel;
