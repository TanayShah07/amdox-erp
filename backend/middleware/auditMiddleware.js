import pool from "../db.js";

export const logAudit = async (action, moduleName) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs (action, module_name)
      VALUES ($1, $2)
      `,
      [action, moduleName]
    );

    console.log(`Audit Logged: ${action}`);
  } catch (err) {
    console.log("Audit Error:", err.message);
  }
};