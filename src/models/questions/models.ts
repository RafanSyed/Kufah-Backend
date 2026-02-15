import { Model } from "sequelize";
import { DataType } from "sequelize-typescript";
import CORE_DB from "../server";
import ClassModel from "../classes/models";
import StudentModel from "../students/models";

class QuestionsModel extends Model {}

QuestionsModel.init(
  {
    id: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    question: {
      type: DataType.STRING,
      allowNull: false,
    },
    answer: {
      type: DataType.STRING,
      allowNull: true,
    },
    isPublic: {
      type: DataType.BOOLEAN,
      allowNull: false,
    },
    classId: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: ClassModel,
        key: "id",
      },
    },
     studentId: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: StudentModel,
        key: "id",
      },
    },
    published: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    side: {
      type: DataType.ENUM("brothers", "sisters"),
      allowNull: false,
    }
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "questions",
    modelName: "questions",
  }
);

// --- Class Wrapper ---
export class Question {
  public id: number;
  public question: string;
  public answer: string | null; 
  public isPublic: boolean; 
  public classId: number; 
  public studentId: number;
  public published: boolean;
  public side?: "brothers" | "sisters";

  constructor(
    id: number,
    question: string,
    answer: string,
    isPublic: boolean, 
    classId: number,
    studentId: number,
    published: boolean,
    side: "brothers" | "sisters"
  ) {
    this.id = id;
    this.question = question;
    this.answer = answer; 
    this.isPublic = isPublic;
    this.classId = classId;
    this.studentId = studentId;
    this.published = published;
    this.side = side;
  }

  public getId(): number {
    return this.id;
  }

  public getQuestion(): string {
    return this.question;
  }

  public getAnswer(): string | null{
    return this.answer
  }

  public getIsPublic(): boolean {
    return this.isPublic
  }

  public getPublished(): boolean { 
    return this.published
  }

  public getSide(): "brothers" | "sisters" | undefined { 
    return this.side
  }
}

export default QuestionsModel;
