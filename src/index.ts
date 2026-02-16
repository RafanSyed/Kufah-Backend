// src/index.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import CORE_DB from "./models/server";
import coreApi from "./api/coreApi";
import cors from "cors";
import cron from "node-cron";

import { runOccurrenceWorker } from "./utils/attendance/occurrenceWorker";
import { scheduleIbadahReminders } from "./utils/notifications/ibadahReminders";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";

app.use(cors({ origin: ORIGIN }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", coreApi);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});

const startServer = async () => {
  try {
    await CORE_DB.authenticate();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // ✅ one cron job every minute
    cron.schedule("* * * * *", runOccurrenceWorker);

    // ✅ run once on startup
    await runOccurrenceWorker();

    console.log("📱 Scheduling Ibadah reminders...");
    scheduleIbadahReminders();
    console.log("✅ Ibadah reminder scheduler initialized");
    
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
