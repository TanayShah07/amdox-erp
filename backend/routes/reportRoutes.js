import express from "express";
import pool from "../db.js";

const router = express.Router();

// EMPLOYEE REPORT
router.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        employee_code,
        name,
        role,
        salary
      FROM employees
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Employee Report Failed",
    });
  }
});

// ATTENDANCE REPORT
router.get("/attendance", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        employee_id,
        employee_name,
        date,
        clock_in,
        clock_out,
        status
      FROM attendance
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Attendance Report Failed",
    });
  }
});

// LEAVE REPORT
router.get("/leaves", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM leaves
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Leave Report Failed",
    });
  }
});

// PAYROLL REPORT
router.get("/payroll", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM payroll
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Payroll Report Failed",
    });
  }
});

export default router;