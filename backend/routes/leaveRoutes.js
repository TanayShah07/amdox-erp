import express from "express";
import { pool } from "../server.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET ALL LEAVES
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      result = await pool.query(`
        SELECT
          l.id,
          l.employee_id,
          e.name AS employee_name,
          l.leave_type,
          l.reason,
          l.status,
          l.from_date,
          l.to_date,
          l.created_at
        FROM leaves l
        LEFT JOIN employees e
          ON l.employee_id = e.employee_code
        ORDER BY l.created_at DESC
      `);
    } else {
      result = await pool.query(
        `
        SELECT
          l.id,
          l.employee_id,
          e.name AS employee_name,
          l.leave_type,
          l.reason,
          l.status,
          l.from_date,
          l.to_date,
          l.created_at
        FROM leaves l
        LEFT JOIN employees e
          ON l.employee_id = e.employee_code
        WHERE l.employee_id = $1
        ORDER BY l.created_at DESC
        `,
        [req.user.employee_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch leaves",
    });
  }
});

// APPLY LEAVE
router.post("/", async (req, res) => {
  try {
    const {
      employee_id,
      leave_type,
      reason,
      from_date,
      to_date,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO leaves
      (
        employee_id,
        leave_type,
        reason,
        status,
        from_date,
        to_date,
        created_at
      )
      VALUES
      (
        $1,$2,$3,
        'Pending',
        $4,$5,
        NOW()
      )
      RETURNING *
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
      leave: result.rows[0],
      message: "Leave Applied Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Leave Apply Failed",
    });
  }
});

// APPROVE LEAVE
router.put("/:id/approve", async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE leaves
      SET status = 'Approved'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      leave: result.rows[0],
      message: "Leave Approved",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Approve Failed",
    });
  }
});

// REJECT LEAVE
router.put("/:id/reject", async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE leaves
      SET status = 'Rejected'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      leave: result.rows[0],
      message: "Leave Rejected",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Reject Failed",
    });
  }
});

export default router;