// src/backend/models/classOccurrences/model.ts
import { Model, DataTypes } from "sequelize";
import CORE_DB from "../server";

class ClassOccurrenceModel extends Model {}

ClassOccurrenceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },

    // FK -> classes.id
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // "School day" in YYYY-MM-DD (no time)
    // This makes it easy to do UNIQUE(class_id, date)
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Exact timestamp for when this class starts (timezone-aware ideally)
    starts_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Mark when you've already created attendance + sent push
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: CORE_DB,
    timestamps: false,
    tableName: "class_occurrences",
    modelName: "class_occurrences",
    indexes: [
      {
        unique: true,
        fields: ["class_id", "date"],
        name: "uniq_class_occurrence_per_day",
      },
      {
        fields: ["starts_at"],
        name: "idx_class_occurrences_starts_at",
      },
      {
        fields: ["processed_at"],
        name: "idx_class_occurrences_processed_at",
      },
    ],
  }
);

// ---- Domain class (same style as your Class model.ts) ----
export class ClassOccurrence {
  constructor(
    id: number,
    class_id: number,
    date: string, // DATEONLY typically comes back as "YYYY-MM-DD"
    starts_at: Date,
    processed_at: Date | null,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.class_id = class_id;
    this.date = date;
    this.starts_at = starts_at;
    this.processed_at = processed_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  public id: number;
  public class_id: number;
  public date: string;
  public starts_at: Date;
  public processed_at: Date | null;
  public created_at: Date;
  public updated_at: Date;

  public getId(): number { return this.id; }
  public getClassId(): number { return this.class_id; }
  public getDate(): string { return this.date; }
  public getStartsAt(): Date { return this.starts_at; }
  public getProcessedAt(): Date | null { return this.processed_at; }
  public getCreatedAt(): Date { return this.created_at; }
  public getUpdatedAt(): Date { return this.updated_at; }
}

export default ClassOccurrenceModel;
