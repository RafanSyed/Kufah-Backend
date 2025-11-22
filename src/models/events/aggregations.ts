// models/events/aggregations.ts
import { Event } from "./models";

export const populateEvent = (data: any): Event => {
  return new Event(
    data.id,
    data.title,
    data.description ?? null,
    // eventDate from Sequelize will usually be a Date already; this keeps it safe
    data.eventDate,
    data.imageUrl ?? null
  );
};
