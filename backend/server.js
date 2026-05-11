import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

<<<<<<< HEAD
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
=======
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
<<<<<<< HEAD
    return res.status(401).json({
      success: false,
      message: "No token",
    });
=======
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
    return res.status(401).json({ success: false, message: "No token" });
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "All fields required",
    });
  }

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

<<<<<<< HEAD
    res.json({
      success: true,
      message: "Signup successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
=======
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  } catch {
    res.status(500).json({ success: false });
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Invalid credentials",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
<<<<<<< HEAD
      return res.json({
        success: false,
        message: "User not found",
      });
=======

      return res.json({ success: false, message: "Invalid credentials" });

      return res.json({ success: false, message: "User not found" });
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
<<<<<<< HEAD
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
=======

      return res.json({ success: false, message: "Invalid credentials" });
      return res.json({ success: false, message: "Invalid credentials" }); // ✅ FIXED
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

<<<<<<< HEAD
    res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

=======
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PROFILE
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= PROFILE ================= */

>>>>>>> 5140917ca530d3f14448efdecd5bde67f658efb5
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// CHANGE PASSWORD
app.post("/change-password", authMiddleware, async (req, res) => {
  const { password, newPassword } = req.body;

  if (!password || !newPassword) {
    return res.json({
      success: false,
      message: "All fields required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Wrong password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

<<<<<<< HEAD
=======
/* ================= EMPLOYEES ================= */

// GET employees
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0
app.get("/employees", authMiddleware, async (req, res) => {
  const { search, role } = req.query;

  try {
    let query = "SELECT * FROM employees WHERE 1=1";
    let values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND name ILIKE $${values.length}`;
    }

    if (role) {
      values.push(role);
      query += ` AND LOWER(role) = LOWER($${values.length})`;
    }

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ADD employee
app.post("/employees", authMiddleware, async (req, res) => {
  const { name, role, salary, projects } = req.body;

  try {
    await pool.query(
      "INSERT INTO employees (name, role, salary, projects) VALUES ($1, $2, $3, $4)",
      [name, role, salary, projects]
    );

    res.json({
      success: true,
      message: "Employee added",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// UPDATE employee
app.put("/employees/:id", authMiddleware, async (req, res) => {
  const { name, role, salary, projects } = req.body;

  const id = req.params.id;

  try {
    await pool.query(
      "UPDATE employees SET name=$1, role=$2, salary=$3, projects=$4 WHERE id=$5",
      [name, role, salary, projects, id]
    );

    res.json({
      success: true,
      message: "Employee updated",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// DELETE employee
app.delete("/employees/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(
      "DELETE FROM employees WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
      message: "Employee deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.get("/projects", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.post("/projects", authMiddleware, async (req, res) => {
  const { name, status, budget } = req.body;

  try {
    await pool.query(
      "INSERT INTO projects (name, status, budget) VALUES ($1, $2, $3)",
      [name, status, budget]
    );

    res.json({
      success: true,
      message: "Project added",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.put("/projects/:id", authMiddleware, async (req, res) => {
  const { name, status, budget } = req.body;

  const id = req.params.id;

  try {
    await pool.query(
      "UPDATE projects SET name=$1, status=$2, budget=$3 WHERE id=$4",
      [name, status, budget, id]
    );

    res.json({
      success: true,
      message: "Project updated",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.delete("/projects/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(
      "DELETE FROM projects WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
      message: "Project deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

<<<<<<< HEAD
app.post("/chatbot", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    const employeesResult = await pool.query(
      "SELECT COUNT(*) FROM employees"
    );

    const projectsResult = await pool.query(
      "SELECT COUNT(*) FROM projects"
    );

    const salaryResult = await pool.query(
      "SELECT COALESCE(SUM(salary),0) AS total FROM employees"
    );

    const employeeProjectsResult = await pool.query(
      "SELECT COALESCE(SUM(projects),0) AS total FROM employees"
    );

    const totalProjects =
      Number(projectsResult.rows[0].count) +
      Number(employeeProjectsResult.rows[0].total);

    const context = `
      ERP System Data:

      Total Employees: ${employeesResult.rows[0].count}

      Total Projects: ${totalProjects}

      Total Salary: ${salaryResult.rows[0].total}
    `;

    const prompt = `
      You are an intelligent ERP assistant chatbot.

      Use the ERP data provided below while answering.

      ${context}

      User Question:
      ${message}
    `;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    res.json({
      success: true,
      reply: response,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      reply:
        "Gemini API quota exceeded or API key issue. Try again later.",
    });
  }
});
=======
>>>>>>> 5140917ca530d3f14448efdecd5bde67f658efb5
/* ================= DASHBOARD ================= */
>>>>>>> e83e1b6c9062082841f0e73041283c2f1f646ba0

app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employees"
    );

    const salary = await pool.query(
      "SELECT COALESCE(SUM(salary), 0) AS total FROM employees"
    );

    const employeeProjects = await pool.query(
      "SELECT COALESCE(SUM(projects), 0) AS total FROM employees"
    );

    const projectsTable = await pool.query(
      "SELECT COUNT(*) FROM projects"
    );

    const totalProjects =
      Number(employeeProjects.rows[0].total) +
      Number(projectsTable.rows[0].count);

    res.json({
      totalEmployees: Number(employees.rows[0].count) || 0,
      totalSalary: Number(salary.rows[0].total) || 0,
      totalProjects: totalProjects || 0,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});