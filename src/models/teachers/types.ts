export interface TeacherRequest {
  id?: number; // Optional for creation
  firstName: string;
  lastName: string;
  email: string;
  
}

export interface Teacher extends TeacherRequest {
  id: number;
  createdAt?: Date; // optional since your model uses timestamps:false
  updatedAt?: Date; // optional since your model uses timestamps:false
  firstName: string;
  lastName: string;
  email: string;
}