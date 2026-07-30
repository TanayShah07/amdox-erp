import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

// GET ALL INVENTORY
export const getInventory = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM inventory ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

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

    await createAuditLog(
      "Admin",
      "Inventory",
      `Added inventory item ${item_name}`
    );

    await createNotification(
      "Inventory Added",
      `${item_name} was added to inventory.`,
      "success"
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

};

// DELETE INVENTORY
export const deleteInventory = async (req, res) => {

  try {

    const item = await pool.query(
      `
      SELECT item_name
      FROM inventory
      WHERE id=$1
      `,
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM inventory WHERE id=$1",
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Inventory",
      `Deleted inventory item ${item.rows[0]?.item_name || ""}`
    );

    await createNotification(
      "Inventory Deleted",
      `${item.rows[0]?.item_name || "Inventory Item"} was deleted.`,
      "error"
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

};