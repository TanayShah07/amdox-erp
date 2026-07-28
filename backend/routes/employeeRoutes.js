import express from "express";
import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM employees
      ORDER BY id ASC
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      employee_code,
      name,
      role,
      salary,
      projects,
    } = req.body;

    const result = await pool.query(
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
      (
        $1,$2,$3,$4,$5
      )
      RETURNING *
      `,
      [
        employee_code,
        name,
        role,
        salary,
        projects,
      ]
    );

    await createAuditLog(
      "Admin",
      "Employees",
      `Added Employee ${name}`
    );

    res.json({
      success: true,
      employee: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      employee_code,
      name,
      role,
      salary,
      projects,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE employees
      SET
        employee_code = $1,
        name = $2,
        role = $3,
        salary = $4,
        projects = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        employee_code,
        name,
        role,
        salary,
        projects,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      employee: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      `
      DELETE FROM employees
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;