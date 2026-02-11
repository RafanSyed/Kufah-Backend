import { Model } from "sequelize";
import { DataType } from "sequelize-typescript";
import CORE_DB from "../server";

// If you already have validation helpers, use them.
// Otherwise delete these imports + validate blocks.
import { validateEmail, } from "../validation";

class TeacherModel extends Model {}

TeacherModel.init(
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
      unique: true,
      validate: {
        async isValidEmail(value: string) {
          // If you don’t have these helpers yet, remove this validate block.
          await validateEmail(value);
        },
      },
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "teachers",
    modelName: "teachers",
  }
);

// --- Class Wrapper ---
export class Teacher {
  public id: number;
  public firstName: string;
  public lastName: string;
  public email: string;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
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

}

export default TeacherModel;