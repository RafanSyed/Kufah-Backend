import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import CORE_DB from "./models/server"; // Sequelize instance
import coreApi from "./api/coreApi"; // Central API router
import cors from "cors";
import cron from "node-cron";
import { sendDailyAttendanceEmails } from "./utils/email/sendDailyAttendanceEmail";

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

// Run attendance job every minute, continuously
const runAttendanceJob = async () => {
  try {
    await sendDailyAttendanceEmails();
  } catch (err) {
    console.error("❌ Error in attendance job:", err);
  }
};

const startServer = async () => {
  try {
    await CORE_DB.authenticate();
    console.log("Database connected");
    await CORE_DB.sync({ alter: true });
    console.log("Models synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Check every minute
    cron.schedule("* * * * *", runAttendanceJob);

  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
