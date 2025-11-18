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
    },
    zoom_link: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
    recordings_folder_link: {
      type: DataTypes.STRING,
      allowNull: true, // optional
    },
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
    days: string[],
    zoom_link?: string,
    recordings_folder_link?: string
  ) {
    this.id = id;
    this.name = name;
    this.time = time;
    this.created_at = created_at;
    this.days = days;
    this.zoom_link = zoom_link;
    this.recordings_folder_link = recordings_folder_link;
  }

  public id: number;
  public name: string;
  public time: string;
  public created_at: Date;
  public days: string[];
  public zoom_link?: string | undefined;
  public recordings_folder_link?: string | undefined;
  
  public getRecordingsFolderLink(): string | undefined { return this.recordings_folder_link; }
  public getDays(): string[] { return this.days; }
  public getZoomLink(): string | undefined { return this.zoom_link; }
  public getId(): number { return this.id; }
  public getName(): string { return this.name; }
  public getTime(): string { return this.time; }
  public getCreatedAt(): Date { return this.created_at; }
}

export default ClassModel;
