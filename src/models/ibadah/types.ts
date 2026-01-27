// ibadah/types.ts

export type IbadahTypeKey = "salawat" | "adhkar" | "istighfar";

/**
 * Shape used to create/update a daily row.
 * day should be "YYYY-MM-DD" (DATEONLY).
 */
export type IbadahDailyRequest = {
  student_id: number;
  day: string; // DATEONLY => "YYYY-MM-DD"

  salawat_done?: number;
  adhkar_done?: number;
  istighfar_done?: number;

  created_at?: Date;
  updated_at?: Date;
};

/**
 * Request for a single "tap" (increment).
 * delta defaults to 1.
 */
export type IbadahTapRequest = {
  student_id: number;
  type: IbadahTypeKey;
  day: string; // "YYYY-MM-DD"
  delta?: number; // optional, defaults to 1
};

/**
 * Returned shape (plain) for a daily row.
 * Mirrors your model fields.
 */
export type IbadahDailyResponse = {
  id: number;
  student_id: number;
  day: string;

  salawat_done: number;
  adhkar_done: number;
  istighfar_done: number;

  created_at: Date;
  updated_at: Date;
};

/**
 * Helpful summary you can return to the app screen.
 * (Optional, but common for UI)
 */
export type IbadahSummary = {
  day: string;
  done: {
    salawat: number;
    adhkar: number;
    istighfar: number;
  };
  // If you add goal columns on students, you can also return:
  goals?: {
    salawat: number;
    adhkar: number;
    istighfar: number;
  };
  remaining?: {
    salawat: number;
    adhkar: number;
    istighfar: number;
  };
};
