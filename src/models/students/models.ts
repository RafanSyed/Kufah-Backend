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
    }
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

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string | undefined = undefined,
    first_class_of_day: string | undefined = undefined,
    takes_saturday_classes: boolean | undefined = false
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
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

}

export default StudentModel;
