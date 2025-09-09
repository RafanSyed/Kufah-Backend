// {
//   "development": {
//     "username": "kufah_admin",
//     "password": "password",
//     "database": "kufah_attendance",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
//   },
//   "test": {
//     "username": "kufah_admin",
//     "password": "password",
//     "database": "kufah_attendance",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
//   },
//   "production": {
//     "username": "kufah_admin",
//     "password": "password",
//     "database": "kufah_attendance",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
//   }
// }
require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME || "kufah_attendance",
    username: process.env.DB_USER || "kufah_admin",
    password: process.env.DB_PASSWORD || "password",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL, // Render DATABASE_URL
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Render uses self-signed certs
      }
    },
    logging: false
  }
};
