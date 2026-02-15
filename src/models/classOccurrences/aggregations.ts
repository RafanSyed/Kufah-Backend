import { ClassOccurrence } from "./models";

export function toPopulateClassOccurrence(data: any): ClassOccurrence {
  return new ClassOccurrence(
    data.id,
    data.class_id,
    data.date,
    data.starts_at,
    data.processed_at, 
    data.created_at,
    data.updated_at,
    data.cancelled_at
  );
}