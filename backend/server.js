import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import chatbotRoutes from "./routes/chatbotRoutes.js";

import pkg from "pg";
import userRoutes from "./routes/userRoutes.js";


// Routes
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const { Pool } = pkg;

const app = express();

/* =========================
   DEBUG (safe checks)
========================= */
console.log("🔑 OPENAI KEY:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");
/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10kb" }));
/* =========================
   POSTGRES CONNECTION
========================= */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // FIX: ensure number
});
export { pool };
// safer DB connection logging
pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leaves", leaveRoutes);
app.use("/reports", reportRoutes);
app.use("/projects", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chatbot", chatbotRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Server Working 🚀");
});

/* =========================
   GLOBAL ERROR HANDLER (IMPORTANT)
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});