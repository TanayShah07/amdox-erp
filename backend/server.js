import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";

<<<<<<< HEAD
=======
dotenv.config();

>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

<<<<<<< HEAD
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false });
  }
};

=======
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

/* ================= AUTH ================= */

// ✅ SIGNUP
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
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
      return res.json({ success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json({ success: true });
<<<<<<< HEAD
  } catch {
    res.status(500).json({ success: false });
=======
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
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
<<<<<<< HEAD
      return res.json({ success: false });
=======
      return res.json({ success: false, message: "Invalid credentials" });
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
<<<<<<< HEAD
      return res.json({ success: false });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
=======
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // 🔐 CREATE TOKEN
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
<<<<<<< HEAD
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false });
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ success: false });
  }
});

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
      return res.json({ success: false });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

=======

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
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
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
<<<<<<< HEAD
  } catch {
=======
  } catch (err) {
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
    res.status(500).json({ error: "error" });
  }
});

<<<<<<< HEAD
=======
// ADD employee
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
app.post("/employees", authMiddleware, async (req, res) => {
  const { name, role, salary, projects } = req.body;

  try {
    await pool.query(
      "INSERT INTO employees (name, role, salary, projects) VALUES ($1, $2, $3, $4)",
      [name, role, salary, projects]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

<<<<<<< HEAD
app.put("/employees/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
=======
// UPDATE employee
app.put("/employees/:id", authMiddleware, async (req, res) => {
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
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

<<<<<<< HEAD
=======
// DELETE employee
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
app.delete("/employees/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

<<<<<<< HEAD
app.listen(5000, () => console.log("Server running on 5000"));
=======
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
>>>>>>> 5c33efc5fb15bba6ec1ff854a0157bbe6ec31db7
