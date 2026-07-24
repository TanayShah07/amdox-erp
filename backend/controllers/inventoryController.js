import pool from "../db.js";

// GET ALL INVENTORY
export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ADD INVENTORY
export const addInventory = async (req, res) => {

  try {

    const {
      item_name,
      category,
      quantity,
      unit_price,
      supplier,
      reorder_level
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO inventory
      (
        item_name,
        category,
        quantity,
        unit_price,
        supplier,
        reorder_level
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        item_name,
        category,
        Number(quantity),
        Number(unit_price),
        supplier,
        Number(reorder_level)
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: err.message });

  }

};

// DELETE INVENTORY
export const deleteInventory = async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM inventory WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: err.message });

  }

};