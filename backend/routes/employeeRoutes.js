import express from "express";

const router = express.Router();

// GET Employees
router.get("/", (req, res) => {

  res.json([
    {
      id: 1,
      employee_code: "EMP001",
      name: "Sai",
      role: "Developer",
      salary: 50000,
      projects: 3,
    },
    {
      id: 2,
      employee_code: "EMP002",
      name: "Lakshmi",
      role: "HR",
      salary: 40000,
      projects: 2,
    },
  ]);

});

// ADD Employee
router.post("/", (req, res) => {

  res.json({
    success: true,
    message: "Employee Added",
  });

});

// UPDATE Employee
router.put("/:id", (req, res) => {

  res.json({
    success: true,
    message: "Employee Updated",
  });

});

// DELETE Employee
router.delete("/:id", (req, res) => {

  res.json({
    success: true,
    message: "Employee Deleted",
  });

});

export default router;