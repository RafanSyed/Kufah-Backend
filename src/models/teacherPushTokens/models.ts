// src/backend/models/teacherPushTokens/models.ts
import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

class TeacherPushTokenModel extends Model {}

TeacherPushTokenModel.init(
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
    },
    push_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "teacher_push_tokens",
    modelName: "teacher_push_tokens",
  }
);

export class TeacherPushToken {
  constructor(
    id: number,
    teacher_id: number,
    push_token: string,
    platform: string | null,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.teacher_id = teacher_id;
    this.push_token = push_token;
    this.platform = platform;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public id: number;
  public teacher_id: number;
  public push_token: string;
  public platform: string | null;
  public is_active: boolean;
  public created_at: Date;
  public updated_at: Date;
}

export default TeacherPushTokenModel;