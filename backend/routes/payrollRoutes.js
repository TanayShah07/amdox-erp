// routes/payrollRoutes.js

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json([]);
});

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Payroll Added",
  });
});

export default router;