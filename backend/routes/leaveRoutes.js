import express from "express";

const router = express.Router();

// GET Leaves
router.get("/", (req, res) => {

  res.json([
    {
      id: 1,
      employee_code: "EMP001",
      name: "Sai",
      leave_type: "Sick Leave",
      reason: "Fever",
      from_date: "2026-05-20",
      to_date: "2026-05-22",
      status: "Pending",
    },
  ]);

});

// APPLY Leave
router.post("/", (req, res) => {

  res.json({
    success: true,
    message: "Leave Applied Successfully",
  });

});

// APPROVE Leave
router.put("/:id/approve", (req, res) => {

  res.json({
    success: true,
    message: "Leave Approved",
  });

});

// REJECT Leave
router.put("/:id/reject", (req, res) => {

  res.json({
    success: true,
    message: "Leave Rejected",
  });

});

export default router;