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

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

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

const authMiddleware = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    console.log(err);

    res.status(401).json({
      success: false,
      message: "Unauthorized",
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

app.post("/signup", async (req, res) => {

  const {
    name,
    email,
    password,
    role,
  } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "All fields required",
    });
  }

  try {

    // CHECK USER EXISTS
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // INSERT USER
    const newUser = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        email,
        hashedPassword,
        role || "employee",
      ]
    );

    const user = newUser.rows[0];

    // AUTO CREATE EMPLOYEE
    if (
      role === "employee" ||
      role === "hr"
    ) {

      const employeeCode =
        "EMP" +
        String(user.id).padStart(3, "0");

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
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          employeeCode,
          name,
          role,
          0,
          0,
        ]
      );
    }

    // JWT TOKEN
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

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Signup failed",
    });

  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

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

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

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
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

app.get(
  "/employees",
  authMiddleware,
  async (req, res) => {
    const { search, role } = req.query;

    try {
      let query = `
        SELECT
          id,
          employee_code,
          name,
          role,
          salary,
          projects
        FROM employees
        WHERE 1=1
      `;

      let values = [];

      if (search) {
        values.push(`%${search}%`);

        query += `
          AND (
            name ILIKE $${values.length}
            OR employee_code ILIKE $${values.length}
          )
        `;
      }

      if (role) {
        values.push(role);

        query += `
          AND LOWER(role) = LOWER($${values.length})
        `;
      }

      query += " ORDER BY id DESC";

      const result = await pool.query(
        query,
        values
      );

      res.json(result.rows);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
      });
    }
  }
);

app.post(
  "/employees",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const {
      employee_code,
      name,
      role,
      salary,
      projects,
    } = req.body;

    try {
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
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          employee_code,
          name,
          role,
          salary,
          projects,
        ]
      );

      res.json({
        success: true,
        message: "Employee added",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.put(
  "/employees/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const id = req.params.id;

    const {
      employee_code,
      name,
      role,
      salary,
      projects,
    } = req.body;

    try {
      await pool.query(
        `
        UPDATE employees
        SET
        employee_code = $1,
        name = $2,
        role = $3,
        salary = $4,
        projects = $5
        WHERE id = $6
        `,
        [
          employee_code,
          name,
          role,
          salary,
          projects,
          id,
        ]
      );

      res.json({
        success: true,
        message: "Employee updated",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.delete(
  "/employees/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
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
      });
    }
  }
);

app.get(
  "/projects",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM projects ORDER BY id DESC"
      );

      res.json(result.rows);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.post(
  "/projects",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const { name, status, budget } =
      req.body;

    try {
      await pool.query(
        `
        INSERT INTO projects
        (name, status, budget)
        VALUES ($1, $2, $3)
        `,
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
      });
    }
  }
);

app.put(
  "/projects/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const id = req.params.id;

    const { name, status, budget } =
      req.body;

    try {
      await pool.query(
        `
        UPDATE projects
        SET
        name = $1,
        status = $2,
        budget = $3
        WHERE id = $4
        `,
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
      });
    }
  }
);

app.delete(
  "/projects/:id",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
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
      });
    }
  }
);

app.get(
  "/dashboard",
  authMiddleware,
  async (req, res) => {
    try {
      const employees = await pool.query(
        "SELECT COUNT(*) FROM employees"
      );

      const salary = await pool.query(
        `
        SELECT COALESCE(SUM(salary),0)
        AS total
        FROM employees
        `
      );

      const employeeProjects =
        await pool.query(`
        SELECT COALESCE(SUM(projects),0)
        AS total
        FROM employees
      `);

      const projectTable =
        await pool.query(
          "SELECT COUNT(*) FROM projects"
        );

      const totalProjects =
        Number(
          employeeProjects.rows[0].total
        ) +
        Number(projectTable.rows[0].count);

      res.json({
        totalEmployees: Number(
          employees.rows[0].count
        ),
        totalSalary: Number(
          salary.rows[0].total
        ),
        totalProjects,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

// ================= ATTENDANCE =================

// GET ATTENDANCE
app.get(
  "/attendance",
  authMiddleware,
  async (req, res) => {
    try {

      let result;

      // ADMIN & HR can see all attendance
      if (
        req.user.role === "admin" ||
        req.user.role === "hr"
      ) {

        result = await pool.query(`
          SELECT
            id,
            employee_id,
            employee_name,
            date,
            clock_in,
            clock_out,
            status
          FROM attendance
          ORDER BY id DESC
        `);

      } else {

        // EMPLOYEE can also see attendance records
        result = await pool.query(`
          SELECT
            id,
            employee_id,
            employee_name,
            date,
            clock_in,
            clock_out,
            status
          FROM attendance
          ORDER BY id DESC
        `);

      }

      res.json(result.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: "Failed to fetch attendance",
      });

    }
  }
);

// CLOCK IN
app.post(
  "/attendance/clock-in",
  authMiddleware,
  async (req, res) => {
    try {

      const { employee_id } = req.body;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "Employee ID required",
        });
      }

      // FIND EMPLOYEE USING EMPLOYEE CODE
      const employee = await pool.query(
        `
        SELECT *
        FROM employees
        WHERE employee_code = $1
        `,
        [employee_id]
      );

      if (employee.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const emp = employee.rows[0];

      const currentDate = new Date()
        .toISOString()
        .split("T")[0];

      // CHECK ALREADY CLOCKED IN
      const already = await pool.query(
        `
        SELECT *
        FROM attendance
        WHERE employee_id = $1
        AND date = $2
        `,
        [
          emp.employee_code,
          currentDate,
        ]
      );

      if (already.rows.length > 0) {
        return res.json({
          success: false,
          message: "Already clocked in today",
        });
      }

      // INSERT ATTENDANCE
      await pool.query(
        `
        INSERT INTO attendance
        (
          employee_id,
          employee_name,
          date,
          clock_in,
          status
        )
        VALUES ($1, $2, $3, NOW(), $4)
        `,
        [
          emp.employee_code,
          emp.name,
          currentDate,
          "Present",
        ]
      );

      res.json({
        success: true,
        message: "Clock In successful",
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: "Clock In failed",
      });

    }
  }
);

// CLOCK OUT
app.post(
  "/attendance/clock-out",
  authMiddleware,
  async (req, res) => {

    try {

      const { employee_id } = req.body;

      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "Employee ID required",
        });
      }

      const currentDate = new Date()
        .toISOString()
        .split("T")[0];

      // CHECK ATTENDANCE
      const attendance = await pool.query(
        `
        SELECT *
        FROM attendance
        WHERE employee_id = $1
        AND date = $2
        `,
        [
          employee_id,
          currentDate,
        ]
      );

      if (attendance.rows.length === 0) {
        return res.json({
          success: false,
          message: "Employee not clocked in today",
        });
      }

      await pool.query(
        `
        UPDATE attendance
        SET clock_out = NOW()
        WHERE employee_id = $1
        AND date = $2
        `,
        [
          employee_id,
          currentDate,
        ]
      );

      res.json({
        success: true,
        message: "Clock Out successful",
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: "Clock Out failed",
      });

    }
  }
);

app.post(
  "/leaves",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        employee_id,
        leave_type,
        reason,
        from_date,
        to_date,
      } = req.body;

      // VALIDATION

      if (
        !employee_id ||
        !leave_type ||
        !reason ||
        !from_date ||
        !to_date
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields required",
        });
      }

      // CHECK EMPLOYEE EXISTS

      const employeeCheck = await pool.query(
        `
        SELECT *
        FROM employees
        WHERE id = $1
        `,
        [employee_id]
      );

      if (employeeCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // INSERT LEAVE

      await pool.query(
        `
        INSERT INTO leaves
        (
          employee_id,
          leave_type,
          reason,
          from_date,
          to_date,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          employee_id,
          leave_type,
          reason,
          from_date,
          to_date,
          "Pending",
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
        message: "Leave apply failed",
      });

    }
  }
);

app.get(
  "/leaves",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
        leaves.*,
        employees.name
        FROM leaves
        JOIN employees
        ON leaves.employee_id::text = employees.id::text
        ORDER BY leaves.id DESC
      `);

      res.json(result.rows);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.put(
  "/leaves/:id/approve",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const id = req.params.id;

    try {
      await pool.query(
        `
        UPDATE leaves
        SET status = 'Approved'
        WHERE id = $1
        `,
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
      });
    }
  }
);

app.put(
  "/leaves/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "hr"),
  async (req, res) => {
    const id = req.params.id;

    try {
      await pool.query(
        `
        UPDATE leaves
        SET status = 'Rejected'
        WHERE id = $1
        `,
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
      });
    }
  }
);

app.post(
  "/chatbot",
  authMiddleware,
  async (req, res) => {
    try {
      const { message } = req.body;

      const employeesResult =
        await pool.query(
          "SELECT COUNT(*) FROM employees"
        );

      const projectsResult =
        await pool.query(
          "SELECT COUNT(*) FROM projects"
        );

      const salaryResult =
        await pool.query(`
        SELECT COALESCE(SUM(salary),0)
        AS total
        FROM employees
      `);

      const employeeProjectsResult =
        await pool.query(`
        SELECT COALESCE(SUM(projects),0)
        AS total
        FROM employees
      `);

      const totalProjects =
        Number(
          projectsResult.rows[0].count
        ) +
        Number(
          employeeProjectsResult.rows[0]
            .total
        );

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
        const result =
          await model.generateContent(
            prompt
          );

        const reply =
          result.response.text();

        res.json({
          success: true,
          reply,
        });
      } catch (geminiError) {
        console.log(geminiError);

        res.json({
          success: true,
          reply:
            "AI temporarily unavailable",
        });
      }
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  }
);

app.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {

      // GET USER
      const userResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userResult.rows[0];

      // FIND EMPLOYEE USING NAME
      const employeeResult = await pool.query(
        `
        SELECT employee_code
        FROM employees
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
        [user.name]
      );

      let employeeCode = "";

      if (employeeResult.rows.length > 0) {
        employeeCode =
          employeeResult.rows[0].employee_code;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employee_code: employeeCode,
        },
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: "Server error",
      });

    }
  }
);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});