import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./db.js";
dotenv.config();
console.log("DB PASSWORD:", process.env.DB_PASSWORD);
console.log("TYPE:", typeof process.env.DB_PASSWORD);
const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log("SIGNUP API HIT");
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Insert new user
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, password]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.post("/login", async (req, res) => {
  console.log("LOGIN API HIT");
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.json({ success: false, message: "Wrong password" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/employees", async (req, res) => {
  const { search, role } = req.query;

  try {
    let query = "SELECT * FROM employees WHERE 1=1";
    let values = [];

    // 🔍 Search by name
    if (search) {
      values.push(`%${search}%`);
      query += ` AND name ILIKE $${values.length}`;
    }

    // 🎯 Filter by role
    if (role) {
      values.push(role);
      query += ` AND role = $${values.length}`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error" });
  }
});

app.post("/employees", async (req, res) => {
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

app.put("/employees/:id", async (req, res) => {
  const id = req.params.id;
  const { name, role, salary, projects } = req.body;

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

app.delete("/employees/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});