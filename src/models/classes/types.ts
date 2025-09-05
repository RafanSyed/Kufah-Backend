export interface ClassRequest {
  id: number;
  name: string;
  time: string; // HH:MM format
  days: string[]; // Array of days, e.g., ["Monday", "Wednesday"]
}
