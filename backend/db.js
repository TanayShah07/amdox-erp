import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Pool } = pkg;

console.log("DB.JS PASSWORD:", process.env.DB_PASSWORD);
console.log("DB.JS TYPE:", typeof process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
});

export default pool;