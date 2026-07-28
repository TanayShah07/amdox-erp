import express from "express";

import {
  getAuditLogs,
  addAuditLog,
  deleteAuditLog,
} from "../controllers/auditLogController.js";

const router = express.Router();

router.get("/", getAuditLogs);

router.post("/", addAuditLog);

router.delete("/:id", deleteAuditLog);

export default router;