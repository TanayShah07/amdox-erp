import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET ALL PAYROLL RECORDS
router.get("/", async (req, res) => {
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
      message: "Server Error",
    });
  }
});

// ADD PAYROLL
router.post("/", async (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      basic_salary,
      bonus,
      deductions,
      pay_date,
    } = req.body;

    const net_salary =
      Number(basic_salary || 0) +
      Number(bonus || 0) -
      Number(deductions || 0);

    const result = await pool.query(
      `
      INSERT INTO payroll
      (
        employee_id,
        employee_name,
        basic_salary,
        bonus,
        deductions,
        net_salary,
        pay_date
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      RETURNING *
      `,
      [
        employee_id,
        employee_name,
        basic_salary,
        bonus,
        deductions,
        net_salary,
        pay_date || new Date(),
      ]
    );

    res.json({
      success: true,
      payroll: result.rows[0],
      message: "Payroll Added Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE PAYROLL
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      `
      DELETE FROM payroll
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Payroll Deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Delete Failed",
    });
  }
});

export default router;