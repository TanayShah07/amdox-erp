import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.status,
        p.budget,
        p.approval_status,
        COALESCE(
          STRING_AGG(DISTINCT e.name, ', '),
          'Not Assigned'
        ) AS assigned_employee
      FROM projects p
      LEFT JOIN assigned_projects ap
        ON p.id = ap.project_id
      LEFT JOIN employees e
        ON ap.employee_code = e.employee_code
      GROUP BY p.id
      ORDER BY p.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/project-employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM employees
      ORDER BY name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, status, budget } = req.body;

    const result = await pool.query(
      `
      INSERT INTO projects
      (name, status, budget, approval_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, status, budget, "In Progress"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, status, budget } = req.body;

    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = $1,
        status = $2,
        budget = $3
      WHERE id = $4
      RETURNING *
      `,
      [name, status, budget, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM assigned_projects WHERE project_id = $1",
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM projects WHERE id = $1",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Project Deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/assign-project", async (req, res) => {
  try {
    const { employee_code, project_id } = req.body;

    const existing = await pool.query(
      `
      SELECT *
      FROM assigned_projects
      WHERE employee_code = $1
      AND project_id = $2
      `,
      [employee_code, project_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Project already assigned",
      });
    }

    await pool.query(
      `
      INSERT INTO assigned_projects
      (employee_code, project_id)
      VALUES ($1, $2)
      `,
      [employee_code, project_id]
    );

    res.json({
      success: true,
      message: "Project Assigned",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id/send-approval", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Pending Approval'
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Sent For Approval",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/approve", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Approved'
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Project Approved",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/reject", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Rejected'
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Project Rejected",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;