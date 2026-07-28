import pool from "../db.js";

export const createAuditLog = async (
  username,
  module,
  action
) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (username, module, action)
      VALUES ($1, $2, $3)
      `,
      [username, module, action]
    );
  } catch (err) {
    console.log("Audit Log Error:", err);
  }
};