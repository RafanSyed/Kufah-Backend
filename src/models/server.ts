import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let CORE_DB: Sequelize;

if (process.env.NODE_ENV === "production") {
  // Production → use Render's DATABASE_URL
  CORE_DB = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Development → use local values
  CORE_DB = new Sequelize(
    process.env.DB_NAME || "kufah_attendance",
    process.env.DB_USER || "kufah_admin",
    process.env.DB_PASSWORD || "password",
    {
      host: process.env.DB_HOST || "127.0.0.1",
      dialect: "postgres",
      logging: false,
    }
  );
}

export default CORE_DB;
