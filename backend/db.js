import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) =>
    console.error("❌ DB Connection Error:", err.message)
  );

export default pool;