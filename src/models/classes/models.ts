import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";


class ClassModel extends Model {}

ClassModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    }
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "classes",
    modelName: "classes",
  }
);

export class Class {
  constructor(
    id: number,
    name: string,
    time: string,
    created_at: Date,
    days: string[]
  ) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.created_at = created_at;
    this.days = days;
  }

  public id: number;
  public name: string;
  public time: string;
  public created_at: Date;
  public days: string[];

  public getDays(): string[] { return this.days; }

  public getId(): number { return this.id; }
  public getName(): string { return this.name; }
  public getTime(): string { return this.time; }
  public getCreatedAt(): Date { return this.created_at; }
}

export default ClassModel;
