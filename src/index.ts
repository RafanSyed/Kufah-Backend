import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import CORE_DB from "./models/server"; // Sequelize instance
import coreApi from "./api/coreApi"; // Central API router
import cors from "cors"; // <- import cors
import cron from "node-cron";
import { sendDailyAttendanceEmails } from "./utils/email/sendDailyAttendanceEmail";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (for development)
app.use(cors({
  origin: "http://localhost:3000" // allow only your frontend
  // or use origin: "*" for testing everything
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount API routes
app.use("/api", coreApi);

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running");
});

let attendanceCheckEnabled = true;
let lastDay = new Date().getDate();

const runAttendanceJob = async () => {
  const today = new Date().getDate();

  // Reset flag if a new day started
  if (today !== lastDay) {
    console.log("🌅 New day detected — re-enabling attendance checks.");
    attendanceCheckEnabled = true;
    lastDay = today;
  }

  if (!attendanceCheckEnabled) {
    console.log(`⏸ Attendance check paused until tomorrow. Current day: ${today}, Last checked day: ${lastDay}, current time: ${new Date().toLocaleString()}`);
    return;
  }

  const hadStudents = await sendDailyAttendanceEmails();

  if (!hadStudents) {
    console.log("⚠️ No students for today. Pausing further checks until tomorrow.");
    attendanceCheckEnabled = false;
  }
};

// Start server after DB connection
const startServer = async () => {
  try {
    await CORE_DB.authenticate();
    console.log("Database connected");

    await CORE_DB.sync({ alter: true });
    console.log("Models synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Schedule daily attendance emails check every minute
    cron.schedule("* * * * *", runAttendanceJob);

  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
