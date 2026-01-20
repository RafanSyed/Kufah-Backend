// noSchool/models.ts
import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

class NoSchoolModel extends Model {
  public id!: number;
  public date!: string;          // "YYYY-MM-DD" (DATEONLY)
  public reason?: string | null; // optional
  public createdBy?: string | null; // optional (email/userId/etc)
}

NoSchoolModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Global “no school” date (used to cancel attendance for that day)
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true, // only one row per date
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "no_school",   // <-- pick your DB table name
    modelName: "no_school",
    indexes: [
      {
        unique: true,
        fields: ["date"], // ✅ enforce one entry per day
      },
    ],
  }
);

export default NoSchoolModel;
