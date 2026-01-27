// ibadah/aggregations.ts
import { IbadahDaily } from "./models";

export const populateIbadahDaily = (row: any): IbadahDaily => {
  return new IbadahDaily(
    row.id,
    row.student_id,
    row.day, // "YYYY-MM-DD"
    row.salawat_done,
    row.adhkar_done,
    row.istighfar_done,
    row.created_at,
    row.updated_at
  );
};
