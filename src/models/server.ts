import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL; // put the full Render URL in env

const CORE_DB = new Sequelize(databaseUrl || "postgres://kufah_admin:password@localhost:5432/kufah_attendance", {
  dialect: "postgres",
  logging: false,
});

export default CORE_DB;
