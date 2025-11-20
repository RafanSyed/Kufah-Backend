// models/events/functions.ts
import EventsModel, { Event } from "./models";
import { populateEvent } from "./aggregations";
import { EventRequest } from "./types";

/**
 * Create a single event
 */
export const createEvent = async (event: EventRequest): Promise<Event> => {
  const response: EventsModel = await EventsModel.create(event as any);
  return populateEvent(response.get({ plain: true }));
};

/**
 * Create multiple events at once
 */
export const createMultipleEvents = async (
  events: EventRequest[]
): Promise<Event[]> => {
  const createdEvents: EventsModel[] = await EventsModel.bulkCreate(
    events as any[],
    { validate: true }
  );

  return createdEvents.map((e) => populateEvent(e.get({ plain: true })));
};

/**
 * Fetch a single event by query (e.g. id or title)
 */
export const fetchEventByQuery = async (
  query: Partial<EventRequest>
): Promise<Event> => {
  const event: EventsModel | null = await EventsModel.findOne({ where: query });
  if (!event)
    throw new Error(`Event not found with query ${JSON.stringify(query)}`);
  return populateEvent(event.get({ plain: true }));
};

/**
 * Fetch all events, optionally filtered by query
 */
export const fetchAllEvents = async (
  query?: Partial<EventRequest>
): Promise<Event[]> => {
  const findOptions = query ? { where: query } : {};
  const events: EventsModel[] = await EventsModel.findAll(findOptions);
  return events.map((e) => populateEvent(e.get({ plain: true })));
};

/**
 * Update a single event by id
 */
export const updateEvent = async (
  id: number,
  updates: Partial<EventRequest>
): Promise<Event> => {
  const event: EventsModel | null = await EventsModel.findByPk(id);
  if (!event) throw new Error(`Event with ID ${id} not found`);

  await event.update(updates);
  return populateEvent(event.get({ plain: true }));
};

/**
 * Delete an event by id
 */
export const deleteEvent = async (id: number): Promise<void> => {
  const event: EventsModel | null = await EventsModel.findByPk(id);
  if (!event) throw new Error(`Event with ID ${id} not found`);

  await event.destroy();
};
