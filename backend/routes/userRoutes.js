import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        employee_id
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    let employee = null;

    if (user.employee_id) {
      const employeeResult = await pool.query(
        `
        SELECT
          employee_code,
          salary,
          projects
        FROM employees
        WHERE employee_code = $1
        `,
        [user.employee_id]
      );

      if (employeeResult.rows.length > 0) {
        employee = employeeResult.rows[0];
      }
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_code:
          employee?.employee_code || null,
        salary:
          employee?.salary || 0,
        projects:
          employee?.projects || 0,
      },
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;