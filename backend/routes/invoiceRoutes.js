import express from "express";
import {
  getInvoices,
  addInvoice,
  deleteInvoice
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getInvoices);
router.post("/", addInvoice);
router.delete("/:id", deleteInvoice);
export default router;