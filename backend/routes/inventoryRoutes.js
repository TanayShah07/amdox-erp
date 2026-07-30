import express from "express";
import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

import {
  getInventory,
  addInventory,
  deleteInventory
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);

router.post("/", addInventory);

router.delete("/:id", deleteInventory);


// UPDATE INVENTORY
router.put("/:id", async (req, res) => {

  try {

    const {
      item_name,
      category,
      quantity,
      unit_price,
      supplier,
      reorder_level
    } = req.body;

    await pool.query(
      `
      UPDATE inventory
      SET
        item_name=$1,
        category=$2,
        quantity=$3,
        unit_price=$4,
        supplier=$5,
        reorder_level=$6
      WHERE id=$7
      `,
      [
        item_name,
        category,
        Number(quantity),
        Number(unit_price),
        supplier,
        Number(reorder_level),
        req.params.id
      ]
    );

    await createAuditLog(
      "Admin",
      "Inventory",
      `Updated inventory item ${item_name}`
    );

    await createNotification(
      "Inventory Updated",
      `${item_name} inventory was updated.`,
      "info"
    );

    res.json({
      success: true,
      message: "Inventory updated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });

  }

});

export default router;