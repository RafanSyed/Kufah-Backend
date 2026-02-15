// models/questions/types.ts
import { Optional } from "sequelize";

export interface QuestionAttributes {
  id: number;
  question: string;
  answer: string | null;
  isPublic: boolean;
  classId: number;
  studentId: number;
  createdAt?: Date;
  updatedAt?: Date;
  published: boolean
  side?: "brothers" | "sisters";
}

export type QuestionCreationAttributes = Optional<
  QuestionAttributes,
  "id" | "answer" | "isPublic" | "createdAt" | "updatedAt"
>;

/**
 * Shape expected when creating/updating from the API layer.
 */
export interface QuestionRequest {
  question: string;
  answer?: string | null;
  isPublic?: boolean;
  classId: number;
  studentId: number;
  published: boolean;
  side: "brothers" | "sisters";
}

export interface QuestionFilters {
  classId?: number;
  studentId?: number;
  isPublic?: boolean;
  published?:boolean;
  side?: "brothers" | "sisters";
}
