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
import payrollRoutes from "./routes/payrollRoutes.js";
import myProjectRoutes from "./routes/myProjectRoutes.js";

const { Pool } = pkg;

const app = express();

/* =========================
   DEBUG (safe checks)
========================= */
console.log(
  "🔑 GEMINI KEY:",
  process.env.GEMINI_API_KEY ? "LOADED" : "MISSING"
);
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
app.use("/payroll", payrollRoutes);
app.use("/my-projects", myProjectRoutes);
/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Server Working 🚀");
});


app.get("/api/profile-stats", async (req, res) => {
  try {
    const employeeCode = req.query.employeeCode;

    const attendance = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE employee_id = $1",
      [employeeCode]
    );

    const leaves = await pool.query(
      "SELECT COUNT(*) FROM leaves WHERE employee_id = $1",
      [employeeCode]
    );

    const projects = await pool.query(
  `
  SELECT COUNT(DISTINCT project_id) AS count
  FROM assigned_projects
  WHERE employee_code = $1
  `,
  [employeeCode]
);

    const employee = await pool.query(
      "SELECT salary FROM employees WHERE employee_code = $1",
      [employeeCode]
    );

    res.json({
      attendance: attendance.rows[0].count,
      leaves: leaves.rows[0].count,
      projects: projects.rows[0].count,
      salary: employee.rows[0]?.salary || 0,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
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