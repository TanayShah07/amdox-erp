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

// ================= GEMINI SETUP =================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ================= AUTH MIDDLEWARE =================

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// ================= SIGNUP =================

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

    // default role
    const role = "employee";

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role]
    );

    res.json({
      success: true,
      message: "Signup successful",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ================= LOGIN =================

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
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
     },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

      res.json({
      success: true,
      token,
      role: user.role,
   });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ================= PROFILE =================

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

// ================= EMPLOYEES =================

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
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ADD employee
app.post( "/employees", authMiddleware, roleMiddleware("admin"), async (req, res) => {
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
app.put( "/employees/:id", authMiddleware, roleMiddleware("admin", "hr"), async (req, res) => {
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
  app.delete("/employees/:id", authMiddleware, roleMiddleware("admin"), async (req, res) =>{
   const id = req.params.id;

  try {
    await pool.query("DELETE FROM employees WHERE id=$1", [id]);

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

// ================= PROJECTS =================

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

app.post( "/projects", authMiddleware, roleMiddleware("admin"), async (req, res) => {
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

app.put("/projects/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
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

app.delete( "/projects/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("DELETE FROM projects WHERE id=$1", [id]);

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

// ================= CHATBOT =================

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

    const prompt = `
You are an intelligent ERP AI assistant.

ERP DATA:
- Total Employees: ${employeesResult.rows[0].count}
- Total Projects: ${totalProjects}
- Total Salary: ₹${salaryResult.rows[0].total}

User Question:
${message}
`;

    try {
      const result = await model.generateContent(prompt);

      const reply = result.response.text();

      res.json({
        success: true,
        reply,
      });
    } catch (geminiError) {
      console.log("Gemini Error:", geminiError.message);

      // Fallback response
      res.json({
        success: true,
        reply: `
Gemini AI is temporarily unavailable.

ERP DATA:
- Employees: ${employeesResult.rows[0].count}
- Projects: ${totalProjects}
- Salary: ₹${salaryResult.rows[0].total}

Your Message:
${message}
        `,
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      reply: "Chatbot server error",
    });
  }
});

/* ================= DASHBOARD ================= */

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
// ================= ATTENDANCE =================

// Clock In
app.post("/attendance/clock-in", authMiddleware, async (req, res) => {
  const { employee_id } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM attendance WHERE employee_id=$1 AND date=CURRENT_DATE",
      [employee_id]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: false,
        message: "Already clocked in today",
      });
    }

    await pool.query(
      "INSERT INTO attendance (employee_id, clock_in, status) VALUES ($1, NOW(), 'Present')",
      [employee_id]
    );

    res.json({
      success: true,
      message: "Clock In successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Clock In error",
    });
  }
});

// Clock Out
app.post("/attendance/clock-out", authMiddleware, async (req, res) => {
  const { employee_id } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE attendance
      SET clock_out = NOW()
      WHERE employee_id=$1
      AND date=CURRENT_DATE
      RETURNING *
      `,
      [employee_id]
    );

    res.json({
      success: true,
      message: "Clock Out successful",
      data: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Clock Out error",
    });
  }
});

// Get Attendance
app.get("/attendance", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        attendance.*,
        employees.name
      FROM attendance
      JOIN employees
      ON attendance.employee_id = employees.id
      ORDER BY attendance.date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Attendance fetch error",
    });
  }
});

// ================= LEAVES =================

// Apply Leave
app.post("/leaves", authMiddleware, async (req, res) => {
  const {
    employee_id,
    leave_type,
    reason,
    from_date,
    to_date,
  } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO leaves
      (employee_id, leave_type, reason, from_date, to_date)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        employee_id,
        leave_type,
        reason,
        from_date,
        to_date,
      ]
    );

    res.json({
      success: true,
      message: "Leave applied successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Leave apply error",
    });
  }
});

// Get Leaves
app.get("/leaves", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        leaves.*,
        employees.name
      FROM leaves
      JOIN employees
      ON leaves.employee_id = employees.id
      ORDER BY leaves.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Leave fetch error",
    });
  }
});

// Approve Leave
app.put("/leave/approve/:id", authMiddleware, roleMiddleware("admin", "hr"), async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(
      "UPDATE leaves SET status='Approved' WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
      message: "Leave approved",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Approval error",
    });
  }
});

// Reject Leave
app.put("/leave/reject/:id", authMiddleware, roleMiddleware("admin", "hr"), async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(
      "UPDATE leaves SET status='Rejected' WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
      message: "Leave rejected",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Reject error",
    });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});