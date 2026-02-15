import { Model } from "sequelize";
import { DataType } from "sequelize-typescript";
import CORE_DB from "../server";

// If you already have validation helpers, use them.
// Otherwise delete these imports + validate blocks.
import { validateEmail } from "../validation";

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
          await validateEmail(value);
        },
      },
    },
    side: {
      type: DataType.ENUM("brothers", "sisters"),
      allowNull: true, 
      defaultValue: null,
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
  public side?: "brothers" | "sisters" | null;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    side?: "brothers" | "sisters" | null
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.side = side ?? null;
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

  public getSide(): "brothers" | "sisters" | null {
    return this.side ?? null;
  }
}

export default TeacherModel;
