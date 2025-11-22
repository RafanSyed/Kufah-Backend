// routes/events.ts
import { Router, Request, Response } from "express";
import multer from "multer";

import {
  createEvent,
  createMultipleEvents,
  fetchAllEvents,
  fetchEventByQuery,
  updateEvent,
  deleteEvent,
} from "../../../models/events/functions";
import { EventRequest } from "../../../models/events/types";
import cloudinary from "../../../utils/cloudinary";

const router = Router();

// Multer: store uploads temporarily on disk.
// For production you might switch to memoryStorage, but this is fine for now.
const upload = multer({ dest: "uploads/" });

/**
 * GET /events
 * Optional query:
 *   - upcoming=true -> only return events with eventDate >= today
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { upcoming } = req.query;

    let events = await fetchAllEvents();

    if (upcoming === "true") {
      const today = new Date();
      events = events.filter((ev) => {
        const d = new Date(ev.eventDate);
        return d >= new Date(today.toDateString());
      });
    }

    res.json(events);
  } catch (err: any) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message || "Failed to fetch events" });
  }
});

/**
 * GET /events/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const event = await fetchEventByQuery({ id });
    res.json(event);
  } catch (err: any) {
    console.error("Error fetching event:", err);
    res.status(404).json({ error: err.message || "Event not found" });
  }
});

/**
 * POST /events
 *
 * Supports two modes:
 *  1) JSON only: { title, description?, eventDate, imageUrl? }
 *  2) multipart/form-data with a file field named "image"
 *     - body fields: title, description, eventDate
 *     - file: image (image file)
 *
 * If an image file is provided, it is uploaded to Cloudinary and
 * the resulting secure_url is stored as imageUrl.
 */
router.post(
  "/",
  upload.single("image"), // 👈 Multer middleware: looks for field name "image"
  async (req: Request, res: Response) => {
    try {
      const { title, description, eventDate, imageUrl: bodyImageUrl } = req.body as any;

      if (!title || !eventDate) {
        return res
          .status(400)
          .json({ error: "title and eventDate are required" });
      }

      let finalImageUrl: string | null = bodyImageUrl ?? null;

      // If a file was uploaded, send it to Cloudinary
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "kufah/events",
        });

        finalImageUrl = uploadResult.secure_url;
      }

      const eventToCreate: EventRequest = {
        // depending on how strict EventRequest is, you may need a cast
        title,
        description: description ?? null,
        eventDate, // string is fine; Sequelize will coerce if model is DATE/DATEONLY
        imageUrl: finalImageUrl,
      } as EventRequest;

      const created = await createEvent(eventToCreate);
      res.status(201).json(created);
    } catch (err: any) {
      console.error("Error creating event:", err);
      res.status(500).json({ error: err.message || "Failed to create event" });
    }
  }
);

/**
 * POST /events/bulk
 * Body: [{ title, description?, eventDate, imageUrl? }, ...]
 * (JSON-only; no file upload here)
 */
router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const events = req.body as EventRequest[];

    if (!Array.isArray(events) || events.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array" });
    }

    const created = await createMultipleEvents(events);
    res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating multiple events:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create multiple events" });
  }
});

/**
 * PUT /events/:id
 * Body: partial EventRequest (JSON only)
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const updates = req.body as Partial<EventRequest>;

    const updated = await updateEvent(id, updates);
    res.json(updated);
  } catch (err: any) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: err.message || "Failed to update event" });
  }
});

/**
 * DELETE /events/:id
 */
router.delete("/events/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    await deleteEvent(id);
    res.status(204).send();
  } catch (err: any) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: err.message || "Failed to delete event" });
  }
});

export default router;
