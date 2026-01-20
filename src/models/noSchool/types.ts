// noSchool/types.ts

// Create (or "cancel attendance for this day")
export interface NoSchoolRequest {
  date: string;          // "YYYY-MM-DD"
  reason?: string;       // optional: "MLK Day", "Weather", "Manual cancel", etc.
}

// Bulk add blocked days (optional, but handy for importing a calendar)
export interface BulkNoSchoolRequest {
  dates: string[];       // ["YYYY-MM-DD", ...]
  reason?: string;       // optional default reason applied to all
}

// For querying a range in the calendar UI
export interface NoSchoolRangeQuery {
  from: string;          // "YYYY-MM-DD"
  to: string;            // "YYYY-MM-DD"
}

// Response shape for "is today blocked?"
export interface NoSchoolStatusResponse {
  blocked: boolean;
  date: string;          // "YYYY-MM-DD"
  reason?: string | null;
}
