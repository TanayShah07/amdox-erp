import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// GET ALL LEAVES
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result;

    if (
      req.user.role === "admin" ||
      req.user.role === "hr"
    ) {
      result = await pool.query(`
        SELECT
          l.id,
          l.employee_id,
          e.name AS employee_name,
          l.leave_type,
          l.reason,
          l.status,
          l.from_date,
          l.to_date,
          l.created_at
        FROM leaves l
        LEFT JOIN employees e
          ON l.employee_id = e.employee_code
        ORDER BY l.created_at DESC
      `);
    } else {
      result = await pool.query(
        `
        SELECT
          l.id,
          l.employee_id,
          e.name AS employee_name,
          l.leave_type,
          l.reason,
          l.status,
          l.from_date,
          l.to_date,
          l.created_at
        FROM leaves l
        LEFT JOIN employees e
          ON l.employee_id = e.employee_code
        WHERE l.employee_id = $1
        ORDER BY l.created_at DESC
        `,
        [req.user.employee_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch leaves",
    });
  }
});

// APPLY LEAVE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      leave_type,
      reason,
      from_date,
      to_date,
    } = req.body;

    const employee_id =
      req.user.role === "employee"
        ? req.user.employee_id
        : req.body.employee_id;

    const result = await pool.query(
      `
      INSERT INTO leaves
      (
        employee_id,
        leave_type,
        reason,
        status,
        from_date,
        to_date,
        created_at
      )
      VALUES
      (
        $1,$2,$3,
        'Pending',
        $4,$5,
        NOW()
      )
      RETURNING *
      `,
      [
        employee_id,
        leave_type,
        reason,
        from_date,
        to_date,
      ]
    );

    await createAuditLog(
      "Employee",
      "Leaves",
      `Applied for ${leave_type} leave`
    );

    await createNotification(
      "Leave Applied",
      `Leave request (${leave_type}) has been submitted.`,
      "info"
    );

    res.json({
      success: true,
      leave: result.rows[0],
      message: "Leave Applied Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Leave Apply Failed",
    });
  }
});

// APPROVE LEAVE
router.put("/:id/approve", async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE leaves
      SET status = 'Approved'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Leaves",
      `Approved leave of ${result.rows[0].employee_id}`
    );

    await createNotification(
      "Leave Approved",
      `Leave request has been approved.`,
      "success"
    );

    res.json({
      success: true,
      leave: result.rows[0],
      message: "Leave Approved",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Approve Failed",
    });
  }
});

// REJECT LEAVE
router.put("/:id/reject", async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE leaves
      SET status = 'Rejected'
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Leaves",
      `Rejected leave of ${result.rows[0].employee_id}`
    );

    await createNotification(
      "Leave Rejected",
      `Leave request has been rejected.`,
      "error"
    );

    res.json({
      success: true,
      leave: result.rows[0],
      message: "Leave Rejected",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Reject Failed",
    });
  }
});

router.get("/pdf", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        l.employee_id,
        e.name AS employee_name,
        l.leave_type,
        l.reason,
        l.status,
        l.from_date,
        l.to_date
      FROM leaves l
      LEFT JOIN employees e
      ON l.employee_id=e.employee_code
      ORDER BY l.created_at DESC
    `);

    const doc = new PDFDocument({
      margin:40,
      size:"A4"
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Leave_Report.pdf"
    );

    doc.pipe(res);

    // Header

    doc
      .rect(0,0,doc.page.width,90)
      .fill("#1E40AF");

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("AMDOX ERP",40,25);

    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Leave Report",40,58);

    doc.fillColor("black");

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Employee Leave Details",40,120);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Generated On : ${new Date().toLocaleString()}`,
        40,
        150
      );

    let y=190;

    doc.font("Helvetica-Bold");

    doc.text("Employee",40,y);
    doc.text("Type",170,y);
    doc.text("Status",260,y);
    doc.text("From",350,y);
    doc.text("To",450,y);

    y+=20;

    doc.moveTo(40,y)
       .lineTo(560,y)
       .stroke();

    y+=10;

    doc.font("Helvetica");

    result.rows.forEach(row=>{

      if(y>740){
        doc.addPage();
        y=50;
      }

      doc.text(row.employee_name||"-",40,y);

      doc.text(row.leave_type,170,y);

      doc.text(row.status,260,y);

      doc.text(
        row.from_date?.toISOString().split("T")[0],
        350,
        y
      );

      doc.text(
        row.to_date?.toISOString().split("T")[0],
        450,
        y
      );

      y+=25;

    });

    doc.end();

  } catch(err){

    console.log(err);

    res.status(500).json({
      message:"PDF Export Failed"
    });

  }
});

router.get("/excel", async (req,res)=>{

  try{

    const workbook=new ExcelJS.Workbook();

    const sheet=
    workbook.addWorksheet("Leaves");

    const result=await pool.query(`
      SELECT
        l.employee_id,
        e.name AS employee_name,
        l.leave_type,
        l.reason,
        l.status,
        l.from_date,
        l.to_date
      FROM leaves l
      LEFT JOIN employees e
      ON l.employee_id=e.employee_code
      ORDER BY l.created_at DESC
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
        width:28
      },

      {
        header:"Leave Type",
        key:"leave_type",
        width:18
      },

      {
        header:"Reason",
        key:"reason",
        width:35
      },

      {
        header:"Status",
        key:"status",
        width:15
      },

      {
        header:"From Date",
        key:"from_date",
        width:18
      },

      {
        header:"To Date",
        key:"to_date",
        width:18
      }

    ];

    sheet.getRow(1).font={
      bold:true,
      color:{argb:"FFFFFF"}
    };

    sheet.getRow(1).fill={
      type:"pattern",
      pattern:"solid",
      fgColor:{argb:"1E40AF"}
    };

    result.rows.forEach(row=>{

      sheet.addRow({
        employee_id:row.employee_id,
        employee_name:row.employee_name,
        leave_type:row.leave_type,
        reason:row.reason,
        status:row.status,
        from_date:row.from_date?.toISOString().split("T")[0],
        to_date:row.to_date?.toISOString().split("T")[0]
      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Leave_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  }

  catch(err){

    console.log(err);

    res.status(500).json({
      message:"Excel Export Failed"
    });

  }

});

export default router;