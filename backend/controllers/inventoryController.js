import pool from "../db.js";

export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addInventory = async (req, res) => {
  try {
    const { item_name, quantity, reorder_level } = req.body;

    const result = await pool.query(
      `
      INSERT INTO inventory
      (item_name, quantity, reorder_level)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [item_name, quantity, reorder_level]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM inventory WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};