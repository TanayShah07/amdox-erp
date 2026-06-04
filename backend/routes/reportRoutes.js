import express from "express";

const router = express.Router();

// EMPLOYEE REPORT
router.get("/employees", (req, res) => {

  res.json([
    {
      employee_code: "EMP001",
      name: "Sai",
      role: "Developer",
      salary: 50000,
    },
  ]);

});

// ATTENDANCE REPORT
router.get("/attendance", (req, res) => {

  res.json([
    {
      employee_id: "EMP001",
      date: "2026-05-28",
      status: "Present",
    },
  ]);

});

// LEAVE REPORT
router.get("/leaves", (req, res) => {

  res.json([
    {
      employee_id: "EMP001",
      leave_type: "Sick Leave",
      reason: "Fever",
      from_date: "2026-05-20",
      to_date: "2026-05-22",
      status: "Approved",
    },
  ]);

});

// PAYROLL REPORT
router.get("/payroll", (req, res) => {

  res.json([
    {
      employee_code: "EMP001",
      name: "Sai",
      role: "Developer",
      salary: 50000,
    },
  ]);

});

export default router;