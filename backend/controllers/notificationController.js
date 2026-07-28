import pool from "../db.js";

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

// Add notification
export const addNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const result = await pool.query(
      `
      INSERT INTO notifications
      (title, message, type)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [title, message, type]
    );

    res.json({
      success: true,
      notification: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to add notification",
    });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {

    await pool.query(
      `
      UPDATE notifications
      SET is_read=true
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed",
    });

  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {

    await pool.query(
      `
      DELETE FROM notifications
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Delete Failed",
    });

  }
};