import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

/* ================= AUTH ================= */

// ✅ SIGNUP
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
  }
});

// ✅ LOGIN (SECURE)
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
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // 🔐 CREATE TOKEN
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

/* ================= MIDDLEWARE ================= */

// 🔐 AUTH MIDDLEWARE (FIXED)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // ✅ EXPECT: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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
      query += ` AND role = $${values.length}`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "error" });
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

    res.json({ success: true });
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// DELETE employee
app.delete("/employees/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================= DASHBOARD ================= */

app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employees");
    const salary = await pool.query("SELECT SUM(salary) FROM employees");
    const projects = await pool.query("SELECT SUM(projects) FROM employees");

    res.json({
      totalEmployees: parseInt(employees.rows[0].count),
      totalSalary: parseInt(salary.rows[0].sum) || 0,
      totalProjects: parseInt(projects.rows[0].sum) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "error" });
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});