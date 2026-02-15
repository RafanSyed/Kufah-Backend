export interface ClassRequest {
  id: number;
  name: string;
  time: string; // HH:MM format
  days: string[]; // Array of days, e.g., ["Monday", "Wednesday"]
  zoom_link?: string; // optional
  recordings_folder_link?: string; // optional
  type?: "combined" | "segregated" | null; // optional, can be null
}
