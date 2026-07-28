import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Get all audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to fetch audit logs",
    });
  }
};

// Add audit log
export const addAuditLog = async (req, res) => {
  try {
    const {
      username,
      module,
      action,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO audit_logs
      (username,module,action)
      VALUES($1,$2,$3)
      RETURNING *
      `,
      [
        username,
        module,
        action,
      ]
    );

    res.json({
      success: true,
      log: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to add audit log",
    });
  }
};

// Delete audit log
export const deleteAuditLog = async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM audit_logs WHERE id=$1",
      [req.params.id]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Delete failed",
    });

  }

};