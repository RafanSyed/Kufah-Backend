import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";
import ClassModel from "../classes/models";
import StudentModel from "../students/models";

class StudentClassModel extends Model {
  public id!: number;
  public studentId!: number;
  public classId!: number;
}

StudentClassModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ClassModel,
        key: "id",
      },
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StudentModel,
        key: "id",
      },
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "student_classes",
    modelName: "student_classes",
    indexes: [
      {
        unique: true,
        fields: ["studentId", "classId"], // ✅ enforce uniqueness per student/class
      },
    ],
  }
);

export default StudentClassModel;
