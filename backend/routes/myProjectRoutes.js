import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const employee = await pool.query(
      `
      SELECT employee_code
      FROM employees
      WHERE LOWER(name) = LOWER($1)
      `,
      [name]
    );

    if (employee.rows.length === 0) {
      return res.json([]);
    }

    const employeeCode =
      employee.rows[0].employee_code;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.status,
        p.budget,
        p.approval_status
      FROM assigned_projects ap
      JOIN projects p
      ON ap.project_id = p.id
      WHERE ap.employee_code = $1
      ORDER BY p.id ASC
      `,
      [employeeCode]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;