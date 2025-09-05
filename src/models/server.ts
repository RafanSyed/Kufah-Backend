// server.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const CORE_DB = new Sequelize(
  process.env.DATABASE_NAME || "kufah_attendance",
  process.env.DATABASE_USER || "kufah_admin",
  process.env.DATABASE_PASSWORD || "password",
  {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  }
);

export default CORE_DB;
