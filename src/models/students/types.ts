export interface StudentRequest {
  id?: number; // Optional for creation
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Student extends StudentRequest {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; 
}