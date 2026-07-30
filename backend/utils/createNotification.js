import pool from "../db.js";

export const createNotification = async (
  title,
  message,
  type = "info"
) => {
  try {
    await pool.query(
      `
      INSERT INTO notifications
      (title, message, type)
      VALUES ($1,$2,$3)
      `,
      [title, message, type]
    );
  } catch (err) {
    console.log("Notification Error:", err);
  }
};