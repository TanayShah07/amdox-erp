import express from "express";

const router = express.Router();

// GET Attendance
router.get("/", async (req, res) => {

  try {

    res.json([
      {
        id: 1,
        employee_id: "EMP001",
        employee_name: "Sai",
        date: new Date(),
        clock_in: new Date(),
        clock_out: new Date(),
        status: "Present",
      },
    ]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// CLOCK IN
router.post("/clock-in", async (req, res) => {

  try {

    res.json({
      success: true,
      message: "Clock In Successful",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Clock In Failed",
    });

  }
});

// CLOCK OUT
router.post("/clock-out", async (req, res) => {

  try {

    res.json({
      success: true,
      message: "Clock Out Successful",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Clock Out Failed",
    });

  }
});

export default router;