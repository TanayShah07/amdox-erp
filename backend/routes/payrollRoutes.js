import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

const router = express.Router();

// GET ALL PAYROLL RECORDS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM payroll
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ADD PAYROLL
router.post("/", async (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      basic_salary,
      bonus,
      deductions,
      pay_date,
    } = req.body;

    const net_salary =
      Number(basic_salary || 0) +
      Number(bonus || 0) -
      Number(deductions || 0);

    const result = await pool.query(
      
      `
      INSERT INTO payroll
      (
        employee_id,
        employee_name,
        basic_salary,
        bonus,
        deductions,
        net_salary,
        pay_date
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      RETURNING *
      `,
      [
        employee_id,
        employee_name,
        basic_salary,
        bonus,
        deductions,
        net_salary,
        pay_date || new Date(),
      ]
    );

    await createAuditLog(
      "Admin",
      "Payroll",
      `Generated payroll for ${employee_name}`
    );

    await createNotification(
      "Payroll Generated",
      `Payroll has been generated for ${employee_name}.`,
      "success"
    );

    res.json({
      success: true,
      payroll: result.rows[0],
      message: "Payroll Added Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE PAYROLL
router.delete("/:id", async (req, res) => {
  try {

    const payroll = await pool.query(
      `
      SELECT employee_name
      FROM payroll
      WHERE id=$1
      `,
      [req.params.id]
    );

    await pool.query(
      `
      DELETE FROM payroll
      WHERE id=$1
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Payroll",
      `Deleted payroll of ${payroll.rows[0]?.employee_name || ""}`
    );

    await createNotification(
      "Payroll Deleted",
      `Payroll of ${payroll.rows[0]?.employee_name || "Employee"} was deleted.`,
      "error"
    );

    res.json({
      success: true,
      message: "Payroll Deleted",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Delete Failed",
    });

  }
});

router.get("/pdf", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM payroll
      ORDER BY id DESC
    `);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Payroll_Report.pdf"
    );

    doc.pipe(res);

    doc
      .rect(0, 0, doc.page.width, 90)
      .fill("#2563EB");

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("AMDOX ERP", 40, 25);

    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Payroll Report", 40, 58);

    doc.fillColor("black");

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Payroll Details", 40, 120);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        `Generated On : ${new Date().toLocaleString()}`,
        40,
        150
      );

    let y = 190;

    doc.font("Helvetica-Bold");

    doc.text("Employee", 40, y);
    doc.text("Basic", 180, y);
    doc.text("Bonus", 260, y);
    doc.text("Net", 340, y);
    doc.text("Date", 450, y);

    y += 20;

    doc.moveTo(40, y).lineTo(560, y).stroke();

    y += 10;

    doc.font("Helvetica");

    result.rows.forEach((row) => {

      if (y > 740) {
        doc.addPage();
        y = 50;
      }

      doc.text(row.employee_name, 40, y);

      doc.text(
        `₹${Number(row.basic_salary).toLocaleString("en-IN")}`,
        180,
        y
      );

      doc.text(
        `₹${Number(row.bonus).toLocaleString("en-IN")}`,
        260,
        y
      );

      doc.text(
        `₹${Number(row.net_salary).toLocaleString("en-IN")}`,
        340,
        y
      );

      doc.text(
        new Date(row.pay_date).toLocaleDateString(),
        450,
        y
      );

      y += 25;

    });

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Payroll PDF Failed",
    });

  }

});

router.get("/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Payroll");

    const result = await pool.query(`
      SELECT *
      FROM payroll
      ORDER BY id DESC
    `);

    sheet.columns = [

      { header: "Employee ID", key: "employee_id", width: 18 },

      { header: "Employee", key: "employee_name", width: 28 },

      { header: "Basic Salary", key: "basic_salary", width: 18 },

      { header: "Bonus", key: "bonus", width: 15 },

      { header: "Deductions", key: "deductions", width: 18 },

      { header: "Net Salary", key: "net_salary", width: 18 },

      { header: "Pay Date", key: "pay_date", width: 20 },

    ];

    sheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" },
    };

    result.rows.forEach((row) => {
      sheet.addRow(row);
    });

    sheet.getColumn("basic_salary").numFmt = '₹#,##0';
    sheet.getColumn("bonus").numFmt = '₹#,##0';
    sheet.getColumn("deductions").numFmt = '₹#,##0';
    sheet.getColumn("net_salary").numFmt = '₹#,##0';

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Payroll_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Payroll Excel Failed",
    });

  }

});

export default router;