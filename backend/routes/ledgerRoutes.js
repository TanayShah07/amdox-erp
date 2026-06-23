import express from "express";
import {
  getLedgerEntries,
  addLedgerEntry,
  deleteLedgerEntry
} from "../controllers/ledgerController.js";

const router = express.Router();

router.get("/", getLedgerEntries);
router.post("/", addLedgerEntry);
router.delete("/:id", deleteLedgerEntry);

export default router;