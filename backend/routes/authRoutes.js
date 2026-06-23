import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
      `,
      [
        name,
        email,
        hashedPassword,
        role || "employee",
      ]
    );

    const user = result.rows[0];

const employeeCode =
  role === "hr"
    ? `HR${String(user.id).padStart(3, "0")}`
    : `EMP${String(user.id).padStart(3, "0")}`;

await pool.query(
  `
  INSERT INTO employees
  (
    employee_code,
    name,
    role,
    salary,
    projects
  )
  VALUES
  ($1,$2,$3,$4,$5)
  `,
  [
    employeeCode,
    name,
    role || "employee",
    0,
    0,
  ]
);

await pool.query(
  `
  UPDATE users
  SET employee_id = $1
  WHERE id = $2
  `,
  [employeeCode, user.id]
);
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "myfallbacksecret123",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        employee_id: user.employee_id,
      },
      process.env.JWT_SECRET || "myfallbacksecret123",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { name, email } = req.body;

    let result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (result.rows.length === 0) {
      const newUser = await pool.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
        `,
        [
          name,
          email,
          "GOOGLE_AUTH",
          "employee",
        ]
      );

      user = newUser.rows[0];
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "myfallbacksecret123",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Google Login Failed",
    });
  }
});

export default router;