import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ATTENDANCE
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      result = await pool.query(`
        SELECT *
        FROM attendance
        ORDER BY id DESC
      `);
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM attendance
        WHERE employee_id = $1
        ORDER BY id DESC
        `,
        [req.user.employee_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// CLOCK IN
router.post(
  "/clock-in",
  authMiddleware,
  async (req, res) => {
    try {
      const employee_id =
        req.user.employee_id;

      const employee = await pool.query(
        `
        SELECT name
        FROM employees
        WHERE employee_code = $1
        `,
        [employee_id]
      );

      if (employee.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const employee_name =
        employee.rows[0].name;

      await pool.query(
        `
        INSERT INTO attendance
        (
          employee_id,
          employee_name,
          date,
          clock_in,
          status
        )
        VALUES
        (
          $1,
          $2,
          CURRENT_DATE,
          NOW(),
          'Present'
        )
        `,
        [employee_id, employee_name]
      );

      await createAuditLog(
        "Employee",
        "Attendance",
        `${employee_name} clocked in`
      );

      await createNotification(
        "Clock In",
        `${employee_name} has clocked in.`,
        "success"
      );

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
  }
);

// CLOCK OUT
router.post(
  "/clock-out",
  authMiddleware,
  async (req, res) => {
    try {
      const employee_id =
        req.user.employee_id;

      const result = await pool.query(
        `
        UPDATE attendance
        SET clock_out = NOW()
        WHERE employee_id = $1
        AND date = CURRENT_DATE
        AND clock_out IS NULL
        RETURNING *
        `,
        [employee_id]
      );

      await createAuditLog(
        "Employee",
        "Attendance",
        `${result.rows[0].employee_name} clocked out`
      );

      await createNotification(
        "Clock Out",
        `${result.rows[0].employee_name} has clocked out.`,
        "info"
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No active attendance record found",
        });
      }

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
  }
);

router.get("/pdf", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM attendance
      ORDER BY id DESC
    `);

    const doc = new PDFDocument({
      margin:40,
      size:"A4"
    });

    res.setHeader("Content-Type","application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Attendance_Report.pdf"
    );

    doc.pipe(res);

    doc
      .rect(0,0,doc.page.width,90)
      .fill("#2563EB");

    doc.fillColor("white")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("AMDOX ERP",40,25);

    doc.font("Helvetica")
       .fontSize(12)
       .text("Attendance Report",40,58);

    doc.fillColor("black");

    doc.font("Helvetica-Bold")
       .fontSize(20)
       .text("Attendance Details",40,120);

    doc.font("Helvetica")
       .fontSize(11)
       .text(
         `Generated On : ${new Date().toLocaleString()}`,
         40,
         150
       );

    let y=190;

    doc.font("Helvetica-Bold");

    doc.text("Employee",40,y);
    doc.text("Date",180,y);
    doc.text("Clock In",280,y);
    doc.text("Clock Out",380,y);
    doc.text("Status",490,y);

    y+=20;

    doc.moveTo(40,y).lineTo(560,y).stroke();

    y+=10;

    doc.font("Helvetica");

    result.rows.forEach(row=>{

      if(y>740){

        doc.addPage();

        y=50;

      }

      doc.text(row.employee_name,40,y);

      doc.text(
        row.date
        ? new Date(row.date).toLocaleDateString()
        : "-",
        180,
        y
      );

      doc.text(
        row.clock_in
        ? new Date(row.clock_in).toLocaleTimeString()
        : "-",
        280,
        y
      );

      doc.text(
        row.clock_out
        ? new Date(row.clock_out).toLocaleTimeString()
        : "-",
        380,
        y
      );

      doc.text(row.status,490,y);

      y+=25;

    });

    doc.end();

  } catch(err){

    console.log(err);

    res.status(500).json({
      message:"Attendance PDF Failed"
    });

  }

});

router.get("/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet("Attendance");

    const result = await pool.query(`
      SELECT *
      FROM attendance
      ORDER BY id DESC
    `);

    sheet.columns=[

      {
        header:"Employee ID",
        key:"employee_id",
        width:18
      },

      {
        header:"Employee Name",
        key:"employee_name",
        width:25
      },

      {
        header:"Date",
        key:"date",
        width:18
      },

      {
        header:"Clock In",
        key:"clock_in",
        width:18
      },

      {
        header:"Clock Out",
        key:"clock_out",
        width:18
      },

      {
        header:"Status",
        key:"status",
        width:15
      }

    ];

    sheet.getRow(1).font={
      bold:true,
      color:{argb:"FFFFFF"}
    };

    sheet.getRow(1).fill={
      type:"pattern",
      pattern:"solid",
      fgColor:{argb:"2563EB"}
    };

    result.rows.forEach(row=>{

      sheet.addRow({

        employee_id:row.employee_id,

        employee_name:row.employee_name,

        date:row.date
          ? new Date(row.date).toLocaleDateString()
          : "",

        clock_in:row.clock_in
          ? new Date(row.clock_in).toLocaleTimeString()
          : "",

        clock_out:row.clock_out
          ? new Date(row.clock_out).toLocaleTimeString()
          : "",

        status:row.status

      });

    });

    sheet.eachRow(row=>{

      row.eachCell(cell=>{

        cell.border={

          top:{style:"thin"},

          left:{style:"thin"},

          bottom:{style:"thin"},

          right:{style:"thin"}

        };

        cell.alignment={

          horizontal:"center",

          vertical:"middle"

        };

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Attendance_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch(err){

    console.log(err);

    res.status(500).json({
      message:"Attendance Excel Failed"
    });

  } 

});
export default router;