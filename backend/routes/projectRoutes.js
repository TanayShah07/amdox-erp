import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.status,
        p.budget,
        p.approval_status,
        COALESCE(
          STRING_AGG(DISTINCT e.name, ', '),
          'Not Assigned'
        ) AS assigned_employee
      FROM projects p
      LEFT JOIN assigned_projects ap
        ON p.id = ap.project_id
      LEFT JOIN employees e
        ON ap.employee_code = e.employee_code
      GROUP BY p.id
      ORDER BY p.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/project-employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM employees
      ORDER BY name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, status, budget } = req.body;

    const result = await pool.query(
      `
      INSERT INTO projects
      (name, status, budget, approval_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, status, budget, "In Progress"]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Created Project ${name}`
    );

    await createNotification(
      "Project Created",
      `${name} has been created successfully.`,
      "success"
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, status, budget } = req.body;

    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = $1,
        status = $2,
        budget = $3
      WHERE id = $4
      RETURNING *
      `,
      [name, status, budget, req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Updated Project ${name}`
    );

    await createNotification(
      "Project Updated",
      `${name} was updated successfully.`,
      "info"
    );

    res.json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    });

router.delete("/:id", async (req, res) => {
  try {
    const project = await pool.query(
      `
      SELECT name
      FROM projects
      WHERE id=$1
      `,
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM assigned_projects WHERE project_id = $1",
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM projects WHERE id = $1",
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Deleted Project ${project.rows[0]?.name || ""}`
    );

    await createNotification(
      "Project Deleted",
      `${project.rows[0]?.name || "Project"} was deleted.`,
      "error"
    );

    res.json({
      success: true,
      message: "Project Deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/assign-project", async (req, res) => {
  try {
    const { employee_code, project_id } = req.body;

    const existing = await pool.query(
      `
      SELECT *
      FROM assigned_projects
      WHERE employee_code = $1
      AND project_id = $2
      `,
      [employee_code, project_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Project already assigned",
      });
    }

    await pool.query(
      `
      INSERT INTO assigned_projects
      (employee_code, project_id)
      VALUES ($1, $2)
      `,
      [employee_code, project_id]
    );

    const employee = await pool.query(
      `
      SELECT name
      FROM employees
      WHERE employee_code=$1
      `,
      [employee_code]
    );

    const project = await pool.query(
      `
      SELECT name
      FROM projects
      WHERE id=$1
      `,
      [project_id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Assigned ${employee.rows[0]?.name} to ${project.rows[0]?.name}`
    );

    await createNotification(
      "Project Assigned",
      `${employee.rows[0]?.name} has been assigned to ${project.rows[0]?.name}.`,
      "success"
    );

    res.json({
      success: true,
      message: "Project Assigned",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id/send-approval", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Pending Approval'
      WHERE id = $1
      `,
      [req.params.id]
    );

    const project = await pool.query(
      `
      SELECT name
      FROM projects
      WHERE id=$1
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Sent ${project.rows[0]?.name} for approval`
    );

    await createNotification(
      "Project Approval",
      `${project.rows[0]?.name} has been sent for approval.`,
      "info"
    );

    res.json({
      success: true,
      message: "Sent For Approval",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/approve", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Approved'
      WHERE id = $1
      `,
      [req.params.id]
    );

    const project = await pool.query(
      `
      SELECT name
      FROM projects
      WHERE id=$1
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Approved Project ${project.rows[0]?.name}`
    );

    await createNotification(
      "Project Approved",
      `${project.rows[0]?.name} has been approved.`,
      "success"
    );

    res.json({
      success: true,
      message: "Project Approved",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/reject", async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE projects
      SET approval_status = 'Rejected'
      WHERE id = $1
      `,
      [req.params.id]
    );

    const project = await pool.query(
      `
      SELECT name
      FROM projects
      WHERE id=$1
      `,
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Projects",
      `Rejected Project ${project.rows[0]?.name}`
    );

    await createNotification(
      "Project Rejected",
      `${project.rows[0]?.name} has been rejected.`,
      "error"
    );

    res.json({
      success: true,
      message: "Project Rejected",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/pdf", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        p.name,
        p.status,
        p.budget,
        p.approval_status,
        COALESCE(
          STRING_AGG(DISTINCT e.name, ', '),
          'Not Assigned'
        ) AS assigned_employee
      FROM projects p
      LEFT JOIN assigned_projects ap
        ON p.id = ap.project_id
      LEFT JOIN employees e
        ON ap.employee_code = e.employee_code
      GROUP BY
        p.id,
        p.name,
        p.status,
        p.budget,
        p.approval_status
      ORDER BY p.id DESC
    `);

    const doc = new PDFDocument({
      margin:40,
      size:"A4"
    });

    res.setHeader("Content-Type","application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Projects_Report.pdf"
    );

    doc.pipe(res);

    // Header

    doc.rect(0,0,doc.page.width,90).fill("#2563EB");

    doc.fillColor("white")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("AMDOX ERP",40,25);

    doc.fontSize(12)
       .font("Helvetica")
       .text("Projects Report",40,58);

    doc.fillColor("black");

    doc.font("Helvetica-Bold")
       .fontSize(20)
       .text("Project Details",40,120);

    doc.font("Helvetica")
       .fontSize(11)
       .text(
         `Generated On : ${new Date().toLocaleString()}`,
         40,
         150
       );

    let y=190;

    doc.font("Helvetica-Bold");

    doc.text("Project",40,y);
    doc.text("Status",170,y);
    doc.text("Budget",260,y);
    doc.text("Approval",350,y);
    doc.text("Assigned",450,y);

    y+=20;

    doc.moveTo(40,y).lineTo(560,y).stroke();

    y+=10;

    doc.font("Helvetica");

    result.rows.forEach(row=>{

      if(y>740){
        doc.addPage();
        y=50;
      }

      doc.text(row.name,40,y);

      doc.text(row.status,170,y);

      doc.text(
        `₹${Number(row.budget).toLocaleString("en-IN")}`,
        260,
        y
      );

      doc.text(row.approval_status,350,y,{
        width:90
      });

      doc.text(row.assigned_employee,450,y,{
        width:110
      });

      y+=30;

    });

    doc.end();

  } catch(err){

    console.log(err);

    res.status(500).json({
      message:"Project PDF Failed"
    });

  }

});

router.get("/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "AMDOX ERP";

    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Projects");

    const result = await pool.query(`
      SELECT
        p.name,
        p.status,
        p.budget,
        p.approval_status,
        COALESCE(
          STRING_AGG(DISTINCT e.name, ', '),
          'Not Assigned'
        ) AS assigned_employee
      FROM projects p
      LEFT JOIN assigned_projects ap
        ON p.id = ap.project_id
      LEFT JOIN employees e
        ON ap.employee_code = e.employee_code
      GROUP BY
        p.id,
        p.name,
        p.status,
        p.budget,
        p.approval_status
      ORDER BY p.id DESC
    `);

    sheet.columns = [

      { header: "Project Name", key: "name", width: 30 },

      { header: "Status", key: "status", width: 18 },

      { header: "Budget", key: "budget", width: 18 },

      { header: "Approval Status", key: "approval_status", width: 22 },

      { header: "Assigned Employee", key: "assigned_employee", width: 40 }

    ];

    // Header Style

    sheet.getRow(1).height = 24;

    sheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" },
    };

    sheet.getRow(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    result.rows.forEach((row) => {

      sheet.addRow({

        name: row.name,

        status: row.status,

        budget: Number(row.budget),

        approval_status: row.approval_status,

        assigned_employee: row.assigned_employee,

      });

    });

    sheet.getColumn("budget").numFmt = '₹#,##0';

    sheet.eachRow((row) => {

      row.eachCell((cell) => {

        cell.border = {

          top: { style: "thin" },

          left: { style: "thin" },

          bottom: { style: "thin" },

          right: { style: "thin" },

        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Projects_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Project Excel Failed",
    });

  }

});

export default router;