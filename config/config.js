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
    database: process.env.DATABASE_NAME || "kufah_attendance",
    username: process.env.DATABASE_USER || "kufah_admin",
    password: process.env.DATABASE_PASSWORD || "password",
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 5432,
    dialect: "postgres",
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,  // Use Render’s DATABASE_URL
    dialect: "postgres",
    logging: false,
  }
};
