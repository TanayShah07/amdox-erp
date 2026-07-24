import express from "express";
import pool from "../db.js";
import {
  getLedgerEntries,
  addLedgerEntry,
  deleteLedgerEntry
} from "../controllers/ledgerController.js";

const router = express.Router();

router.get("/", getLedgerEntries);
router.post("/", addLedgerEntry);
router.delete("/:id", deleteLedgerEntry);
router.put("/:id", async (req, res) => {
  try {
    const { type, amount, description, currency } = req.body;

    await pool.query(`
      UPDATE ledger_entries
      SET
        type=$1,
        amount=$2,
        description=$3,
        currency=$4
      WHERE id=$5
      `, [
        type,
        amount,
        description,
        currency,
        req.params.id,
      ]);

    res.json({
      success: true,
      message: "Ledger updated successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

export default router;