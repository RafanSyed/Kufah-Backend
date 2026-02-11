import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";
import ClassModel from "../classes/models";
import TeacherModel from "../teachers/models";

class TeacherClassesModel extends Model {
  public id!: number;
  public teacherId!: number;
  public classId!: number;
}

TeacherClassesModel.init(
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
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TeacherModel,
        key: "id",
      },
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "teacher_classes",
    modelName: "teacher_classes",
    indexes: [
      {
        unique: true,
        fields: ["teacherId", "classId"], // ✅ enforce uniqueness per teacher/class
      },
    ],
  }
);

export default TeacherClassesModel;