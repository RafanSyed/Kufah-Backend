// src/events/types.ts

// models/events/types.ts
export interface EventRequest {
  id?: number;                          // optional
  title: string;
  description?: string | null;          // optional
  eventDate: string;             // whatever you're using
  imageUrl?: string | null;             // optional
  createdAt?: Date;                     // optional
  updatedAt?: Date;                     // optional
}


// Payload used when creating an event from the API
export interface CreateEventPayload {
  title: string;
  description?: string | null;
  eventDate: string; // YYYY-MM-DD
  imageUrl?: string | null; // Cloudinary URL
}

// Payload used when updating an event
export interface UpdateEventPayload {
  title?: string;
  description?: string | null;
  eventDate?: string;
  imageUrl?: string | null;
}
