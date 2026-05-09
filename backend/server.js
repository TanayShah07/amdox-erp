import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ================= AUTH MIDDLEWARE ================= */

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
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
  }

  try {
    const token = authHeader.split(" ")[1]; // ✅ FIXED
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/* ================= AUTH ================= */

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields required" });
  }

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  } catch {
    res.status(500).json({ success: false });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {

      return res.json({ success: false, message: "Invalid credentials" });

      return res.json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

      return res.json({ success: false, message: "Invalid credentials" });
      return res.json({ success: false, message: "Invalid credentials" }); // ✅ FIXED
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

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
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ success: false });
  }
});

// CHANGE PASSWORD
app.post("/change-password", authMiddleware, async (req, res) => {
  const { password, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2",
      [hashedPassword, req.user.id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= EMPLOYEES ================= */

// GET employees
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
  } catch {
    res.status(500).json({ error: "error" });
  }
});

// ADD employee
app.post("/employees", authMiddleware, async (req, res) => {
  const { name, role, salary, projects } = req.body;

  try {
    await pool.query(
      "INSERT INTO employees (name, role, salary, projects) VALUES ($1,$2,$3,$4)",
      [name, role, salary, projects]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
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

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// DELETE employee
app.delete("/employees/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= PROJECTS ================= */

app.get("/projects", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(result.rows);
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/projects", authMiddleware, async (req, res) => {
  const { name, status, budget } = req.body;

  try {
    await pool.query(
      "INSERT INTO projects (name, status, budget) VALUES ($1,$2,$3)",
      [name, status, budget]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
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

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.delete("/projects/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM projects WHERE id=$1", [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

>>>>>>> 5140917ca530d3f14448efdecd5bde67f658efb5
/* ================= DASHBOARD ================= */

app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employees");
    const salary = await pool.query("SELECT SUM(salary) FROM employees");
    const projects = await pool.query("SELECT COUNT(*) FROM projects");

    res.json({
      totalEmployees: parseInt(employees.rows[0].count),
      totalSalary: parseInt(salary.rows[0].sum) || 0,
      totalProjects: parseInt(projects.rows[0].count), // ✅ FIXED
    });
  } catch {
    res.status(500).json({ error: "error" });
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});