import { Model } from "sequelize";
import { DataType } from "sequelize-typescript";
import CORE_DB from "../server";
import { validateStudentEmail, validateStudentPhone } from "../validation";

class StudentModel extends Model {}

StudentModel.init(
  {
    id: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataType.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataType.STRING,
      allowNull: false,
    },
    email: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        async isValidEmail(value: string) {
          await validateStudentEmail(value);
        },
      },
    },
    phone: {
      type: DataType.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value: string) {
          validateStudentPhone(value);
        },
      },
    },
    salawat_goal_daily: {
      type: DataType.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    adhkar_goal_daily: {
      type: DataType.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    istighfar_goal_daily: {
      type: DataType.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "students",
    modelName: "students",
  }
);

// --- Class Wrapper ---
export class Student {
  public id: number;
  public firstName: string;
  public lastName: string;
  public email: string;
  public phone: string | undefined;
  public salawat_goal_daily: number;
  public adhkar_goal_daily: number;
  public istighfar_goal_daily: number;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string | undefined = undefined,
    salawat_goal_daily: number,
    adhkar_goal_daily: number,
    istighfar_goal_daily: number
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.salawat_goal_daily = salawat_goal_daily;
    this.adhkar_goal_daily = adhkar_goal_daily;
    this.istighfar_goal_daily = istighfar_goal_daily;
  }

  public getId(): number {
    return this.id;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPhone(): string | undefined {
    return this.phone;
  }

  public getSalawatGoalDaily(): number {
    return this.salawat_goal_daily;
  }

  public getAdhkarGoalDaily(): number {
    return this.adhkar_goal_daily;
  }

  public getIstighfarGoalDaily(): number {
    return this.istighfar_goal_daily;
  }
}

export default StudentModel;
