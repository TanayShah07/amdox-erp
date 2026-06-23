import express from "express";
import {
  getInventory,
  addInventory,
  deleteInventory
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.post("/", addInventory);
router.delete("/:id", deleteInventory);
export default router;