import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./db.js";

import chatbotRoutes from "./routes/chatbotRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import myProjectRoutes from "./routes/myProjectRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import reportAnalyticsRoutes from "./routes/reportAnalyticsRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";

const app = express();

console.log(
  "🔑 GEMINI KEY:",
  process.env.GEMINI_API_KEY ? "LOADED" : "MISSING"
);

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10kb" }));

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
app.use("/ledger", ledgerRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/analytics",reportAnalyticsRoutes);
app.use("/purchase-orders", purchaseOrderRoutes);
app.use("/notifications", notificationRoutes);
app.use("/audit-logs", auditLogRoutes);

app.get("/", (req, res) => {
  res.send("Server Working 🚀");
});

app.get("/api/profile-stats", async (req, res) => {
  try {
    const employeeCode = req.query.employeeCode;

    const attendance = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE employee_id=$1",
      [employeeCode]
    );

    const leaves = await pool.query(
      "SELECT COUNT(*) FROM leaves WHERE employee_id=$1",
      [employeeCode]
    );

    const projects = await pool.query(
      `
      SELECT COUNT(DISTINCT project_id) AS count
      FROM assigned_projects
      WHERE employee_code=$1
      `,
      [employeeCode]
    );

    const employee = await pool.query(
      "SELECT salary FROM employees WHERE employee_code=$1",
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

app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employees"
    );

    const salary = await pool.query(
      "SELECT COALESCE(SUM(salary),0) FROM employees"
    );

    const projects = await pool.query(
      "SELECT COUNT(*) FROM projects"
    );

    const completedProjects = await pool.query(
      `
      SELECT COUNT(*) 
      FROM projects
      WHERE LOWER(status) = 'completed'
      `
    );

    const pendingProjects = await pool.query(
      `
      SELECT COUNT(*) 
      FROM projects
      WHERE LOWER(status) != 'completed'
      `
    );

    res.json({
      employees: Number(
        employees.rows[0].count
      ),

      salary: Number(
        salary.rows[0].coalesce
      ),

      projects: Number(
        projects.rows[0].count
      ),

      completedProjects: Number(
        completedProjects.rows[0].count
      ),

      pendingProjects: Number(
        pendingProjects.rows[0].count
      ),
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/api/employee-growth", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        employee_code
      FROM employees
      ORDER BY id ASC
    `);

    const data = result.rows.map(
      (_, index) => ({
        month: `Emp ${index + 1}`,
        employees: index + 1,
      })
    );

    res.json(data);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/api/salary-overview", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        employee_code,
        salary
      FROM employees
      ORDER BY employee_code
    `);

    res.json(
      result.rows.map((row) => ({
        month: row.employee_code,
        salary: Number(row.salary),
      }))
    );
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});