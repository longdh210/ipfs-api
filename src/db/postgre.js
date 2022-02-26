const Pool = require("pg").Pool;
const pool = new Pool({
  host: process.env.CONNECTION_URL,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
});

module.exports = pool;