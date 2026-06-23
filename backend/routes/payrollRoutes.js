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
      employee_code,
      basic_salary,
      bonus,
      deduction,
      pay_date,
    } = req.body;

    // Get employee name
    const employee = await pool.query(
      `
      SELECT name
      FROM employees
      WHERE employee_code = $1
      `,
      [employee_code]
    );

    if (employee.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const employee_name =
      employee.rows[0].name;

    const net_salary =
      Number(basic_salary) +
      Number(bonus || 0) -
      Number(deduction || 0);

    const result = await pool.query(
      `
      INSERT INTO payroll
      (
        employee_code,
        employee_name,
        basic_salary,
        bonus,
        deduction,
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
        employee_code,
        employee_name,
        basic_salary,
        bonus,
        deduction,
        net_salary,
        pay_date,
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
      message: "Payroll Add Failed",
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