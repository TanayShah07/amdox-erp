import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ATTENDANCE
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      result = await pool.query(`
        SELECT *
        FROM attendance
        ORDER BY id DESC
      `);
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM attendance
        WHERE employee_id = $1
        ORDER BY id DESC
        `,
        [req.user.employee_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// CLOCK IN
router.post(
  "/clock-in",
  authMiddleware,
  async (req, res) => {
    try {
      const employee_id =
        req.user.employee_id;

      const employee = await pool.query(
        `
        SELECT name
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

      const employee_name =
        employee.rows[0].name;

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
        VALUES
        (
          $1,
          $2,
          CURRENT_DATE,
          NOW(),
          'Present'
        )
        `,
        [employee_id, employee_name]
      );

      res.json({
        success: true,
        message: "Clock In Successful",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: "Clock In Failed",
      });
    }
  }
);

// CLOCK OUT
router.post(
  "/clock-out",
  authMiddleware,
  async (req, res) => {
    try {
      const employee_id =
        req.user.employee_id;

      const result = await pool.query(
        `
        UPDATE attendance
        SET clock_out = NOW()
        WHERE employee_id = $1
        AND date = CURRENT_DATE
        AND clock_out IS NULL
        RETURNING *
        `,
        [employee_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No active attendance record found",
        });
      }

      res.json({
        success: true,
        message: "Clock Out Successful",
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: "Clock Out Failed",
      });
    }
  }
);

export default router;