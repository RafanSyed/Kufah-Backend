export interface StudentRequest {
  id?: number; // Optional for creation
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  salawat_goal_daily?: number;
  adhkar_goal_daily?: number;
  istighfar_goal_daily?: number;
  side?: "brothers" | "sisters" | null;
}


export interface Student extends StudentRequest {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  salawat_goal_daily?: number;
  adhkar_goal_daily?: number;
  istighfar_goal_daily?: number; 
  side?: "brothers" | "sisters" | null;
}

// students/types.ts

export type StudentGoalsUpdate = {
  salawat_goal_daily?: number;
  adhkar_goal_daily?: number;
  istighfar_goal_daily?: number;
};
