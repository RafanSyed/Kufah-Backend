// models/ibadah.model.ts
import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

/**
 * V1 (students-only)
 * - Goals live on the students table (salawat_goal_daily, etc.)
 * - Progress lives here per student per day (ibadah_daily)
 *
 * Make sure your DB has a UNIQUE constraint on (student_id, day)
 */

class IbadahDailyModel extends Model {}

IbadahDailyModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // If you have StudentsModel you can add references:
      // references: { model: "students", key: "id" },
      // onDelete: "CASCADE",
      // onUpdate: "CASCADE",
    },

    // Store the "day" (date only) so each day gets its own row
    day: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Progress counters (count UP)
    salawat_done: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    adhkar_done: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    istighfar_done: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false, // we manage created_at / updated_at manually
    tableName: "ibadah_daily",
    modelName: "ibadah_daily",
    indexes: [
      {
        unique: true,
        fields: ["student_id", "day"], // <-- critical for upsert
        name: "ibadah_daily_student_day_unique",
      },
      {
        fields: ["day"],
        name: "ibadah_daily_day_idx",
      },
    ],
  }
);

export class IbadahDaily {
  constructor(
    id: number,
    student_id: number,
    day: string, // DATEONLY returns as string "YYYY-MM-DD"
    salawat_done: number,
    adhkar_done: number,
    istighfar_done: number,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.student_id = student_id;
    this.day = day;
    this.salawat_done = salawat_done;
    this.adhkar_done = adhkar_done;
    this.istighfar_done = istighfar_done;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public id: number;
  public student_id: number;
  public day: string;

  public salawat_done: number;
  public adhkar_done: number;
  public istighfar_done: number;

  public created_at: Date;
  public updated_at: Date;

  public getId(): number {
    return this.id;
  }
  public getStudentId(): number {
    return this.student_id;
  }
  public getDay(): string {
    return this.day;
  }

  public getSalawatDone(): number {
    return this.salawat_done;
  }
  public getAdhkarDone(): number {
    return this.adhkar_done;
  }
  public getIstighfarDone(): number {
    return this.istighfar_done;
  }

  public getCreatedAt(): Date {
    return this.created_at;
  }
  public getUpdatedAt(): Date {
    return this.updated_at;
  }
}

export default IbadahDailyModel;
