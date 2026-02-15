// src/backend/models/announcements/model.ts
import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

class AnnouncementModel extends Model {}

AnnouncementModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Which teacher created this announcement',
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = announcement for ALL students
      comment: 'Which class this announcement is for (null = all students)',
    },
    target_side: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'For segregated classes: "brothers", "sisters", or null for combined/all',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Announcement title/subject',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Announcement content',
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
    timestamps: false,
    tableName: "announcements",
    modelName: "announcements",
    indexes: [
      {
        fields: ["teacher_id"],
        name: "idx_announcements_teacher_id",
      },
      {
        fields: ["class_id"],
        name: "idx_announcements_class_id",
      },
      {
        fields: ["created_at"],
        name: "idx_announcements_created_at",
      },
    ],
  }
);

// Domain class
export class Announcement {
  constructor(
    id: number,
    teacher_id: number,
    class_id: number | null,
    target_side: string | null,
    title: string,
    message: string,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.teacher_id = teacher_id;
    this.class_id = class_id;
    this.target_side = target_side;
    this.title = title;
    this.message = message;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public id: number;
  public teacher_id: number;
  public class_id: number | null;
  public target_side: string | null;
  public title: string;
  public message: string;
  public created_at: Date;
  public updated_at: Date;

  public getId(): number { return this.id; }
  public getTeacherId(): number { return this.teacher_id; }
  public getClassId(): number | null { return this.class_id; }
  public getTargetSide(): string | null { return this.target_side; }
  public getTitle(): string { return this.title; }
  public getMessage(): string { return this.message; }
  public getCreatedAt(): Date { return this.created_at; }
  public getUpdatedAt(): Date { return this.updated_at; }
  
  // Helper methods
  public isForAllStudents(): boolean {
    return this.class_id === null;
  }
  
  public isForSpecificSide(): boolean {
    return this.target_side !== null && this.target_side !== "";
  }
}

export default AnnouncementModel;