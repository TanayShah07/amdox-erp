import express from "express";

const router = express.Router();

// GET Projects
router.get("/", (req, res) => {

  res.json([
    {
      id: 1,
      project_name: "ERP System",
      client: "ABC Company",
      status: "Completed",
    },
    {
      id: 2,
      project_name: "HR Portal",
      client: "XYZ Company",
      status: "Pending",
    },
  ]);

});

export default router;