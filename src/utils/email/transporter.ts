// utils/email/transporter.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,          // ✅ enable connection pooling
  maxConnections: 1,   // ✅ only 1 connection at a time
  maxMessages: 50,     // ✅ reuse connection for 50 emails before refreshing
});
