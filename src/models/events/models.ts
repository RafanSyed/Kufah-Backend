import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";


class EventsModel extends Model {}

EventsModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eventDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize: CORE_DB,
      modelName: "Event",
      tableName: "Events", // matches the migration
    }
  );

export class Event {
  constructor(
    id: number,
    title: string,
    description: string | null,
    eventDate: string,
    imageUrl: string | null,
  ) {
    this.id = id;
    this.title = title;
    this.description = description ?? null;
    this.eventDate = eventDate;
    this.imageUrl = imageUrl ?? null;
  }

  public id: number;
  public title: string;
  public description: string | null;
  public eventDate: string;
  public imageUrl: string | null;

  public getTitle(): string { return this.title }
  public getDescription(): string | null { return this.description }
  public getEventDate(): string { return this.eventDate }
  public getImageURL(): string | null {return this.imageUrl }

}


export default EventsModel;
