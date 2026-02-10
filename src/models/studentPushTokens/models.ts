import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

class StudentPushTokenModel extends Model {}

StudentPushTokenModel.init(
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
    tableName: "student_push_tokens",
    modelName: "student_push_tokens",
  }
);

export class StudentPushToken {
  constructor(
    id: number,
    student_id: number,
    push_token: string,
    platform: string | null,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.student_id = student_id;
    this.push_token = push_token;
    this.platform = platform;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public id: number;
  public student_id: number;
  public push_token: string;
  public platform: string | null;
  public is_active: boolean;
  public created_at: Date;
  public updated_at: Date;

  public getId() { return this.id; }
  public getStudentId() { return this.student_id; }
  public getPushToken() { return this.push_token; }
  public getPlatform() { return this.platform; }
  public getIsActive() { return this.is_active; }
  public getCreatedAt() { return this.created_at; }
  public getUpdatedAt() { return this.updated_at; }
}

export default StudentPushTokenModel;
