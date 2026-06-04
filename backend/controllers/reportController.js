import pool from "../db.js";

import PDFDocument from "pdfkit";

import ExcelJS from "exceljs";


// EMPLOYEE REPORT

export const employeeReport =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM employees
          ORDER BY id DESC
        `);

      res.json(result.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// EXPORT PDF

export const exportEmployeePDF =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM employees
          ORDER BY id DESC
        `);

      const employees =
        result.rows;

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employees.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(20)
        .text(
          "Employee Report",
          {
            align: "center",
          }
        );

      doc.moveDown();

      employees.forEach((emp) => {

        doc.text(
          `Code: ${emp.employee_code}`
        );

        doc.text(
          `Name: ${emp.name}`
        );

        doc.text(
          `Role: ${emp.role}`
        );

        doc.text(
          `Salary: ${emp.salary}`
        );

        doc.moveDown();
      });

      doc.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// EXPORT EXCEL

export const exportEmployeeExcel =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM employees
          ORDER BY id DESC
        `);

      const employees =
        result.rows;

      const workbook =
        new ExcelJS.Workbook();

      const worksheet =
        workbook.addWorksheet(
          "Employees"
        );

      worksheet.columns = [

        {
          header: "Employee Code",
          key: "employee_code",
          width: 20,
        },

        {
          header: "Name",
          key: "name",
          width: 25,
        },

        {
          header: "Role",
          key: "role",
          width: 20,
        },

        {
          header: "Salary",
          key: "salary",
          width: 15,
        },
      ];

      employees.forEach((emp) => {

        worksheet.addRow(emp);

      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employees.xlsx"
      );

      await workbook.xlsx.write(res);

      res.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };
  // ================= ATTENDANCE REPORT =================

// ================= ATTENDANCE REPORT =================

export const attendanceReport =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            employee_id,
            date,
            status
          FROM attendance
          ORDER BY id DESC
        `);

      res.json(result.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };
// ================= ATTENDANCE PDF =================

export const exportAttendancePDF =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
  employee_id,
  date,
  status
FROM attendance
          ORDER BY id DESC
        `);

      const attendance =
        result.rows;

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(20)
        .text(
          "Attendance Report",
          {
            align: "center",
          }
        );

      doc.moveDown();

      attendance.forEach((a) => {

        doc.text(
          `Employee ID: ${a.employee_id}`
        );

        

        doc.text(
          `Date: ${a.date}`
        );

        doc.text(
          `Status: ${a.status}`
        );

        doc.moveDown();

      });

      doc.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// ================= ATTENDANCE EXCEL =================

export const exportAttendanceExcel =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            employee_id,
            date,
            status
          FROM attendance
          ORDER BY id DESC
        `);

      const attendance =
        result.rows;

      const workbook =
        new ExcelJS.Workbook();

      const worksheet =
        workbook.addWorksheet(
          "Attendance"
        );

      worksheet.columns = [

        {
          header: "Employee ID",
          key: "employee_id",
          width: 20,
        },



        {
          header: "Date",
          key: "date",
          width: 20,
        },

        {
          header: "Status",
          key: "status",
          width: 20,
        },
      ];

      attendance.forEach((a) => {

        worksheet.addRow(a);

      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance.xlsx"
      );

      await workbook.xlsx.write(res);

      res.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };
  // ================= LEAVE REPORT =================

export const leaveReport =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM leaves
          ORDER BY id DESC
        `);

      res.json(result.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// ================= LEAVE PDF =================

export const exportLeavePDF =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM leaves
          ORDER BY id DESC
        `);

      const leaves =
        result.rows;

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=leaves.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(20)
        .text(
          "Leave Report",
          {
            align: "center",
          }
        );

      doc.moveDown();

      leaves.forEach((l) => {

        doc.text(
          `Employee ID: ${l.employee_id}`
        );

        doc.text(
          `Leave Type: ${l.leave_type}`
        );

        doc.text(
          `From: ${l.from_date}`
        );

        doc.text(
          `To: ${l.to_date}`
        );

        doc.text(
          `Status: ${l.status}`
        );

        doc.moveDown();

      });

      doc.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// ================= LEAVE EXCEL =================

export const exportLeaveExcel =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT *
          FROM leaves
          ORDER BY id DESC
        `);

      const leaves =
        result.rows;

      const workbook =
        new ExcelJS.Workbook();

      const worksheet =
        workbook.addWorksheet(
          "Leaves"
        );

      worksheet.columns = [

        {
          header: "Employee ID",
          key: "employee_id",
          width: 20,
        },

        {
          header: "Leave Type",
          key: "leave_type",
          width: 25,
        },

        {
          header: "From Date",
          key: "from_date",
          width: 20,
        },

        {
          header: "To Date",
          key: "to_date",
          width: 20,
        },

        {
          header: "Status",
          key: "status",
          width: 20,
        },
      ];

      leaves.forEach((l) => {

        worksheet.addRow(l);

      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=leaves.xlsx"
      );

      await workbook.xlsx.write(res);

      res.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };
  // ================= PAYROLL REPORT =================

export const payrollReport =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            employee_code,
            name,
            role,
            salary
          FROM employees
          ORDER BY id DESC
        `);

      res.json(result.rows);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// ================= PAYROLL PDF =================

export const exportPayrollPDF =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            employee_code,
            name,
            role,
            salary
          FROM employees
          ORDER BY id DESC
        `);

      const payroll =
        result.rows;

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=payroll.pdf"
      );

      doc.pipe(res);

      doc
        .fontSize(20)
        .text(
          "Payroll Report",
          {
            align: "center",
          }
        );

      doc.moveDown();

      payroll.forEach((p) => {

        doc.text(
          `Employee Code: ${p.employee_code}`
        );

        doc.text(
          `Name: ${p.name}`
        );

        doc.text(
          `Role: ${p.role}`
        );

        doc.text(
          `Salary: ₹${p.salary}`
        );

        doc.moveDown();

      });

      doc.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };


// ================= PAYROLL EXCEL =================

export const exportPayrollExcel =
  async (req, res) => {

    try {

      const result =
        await pool.query(`
          SELECT
            employee_code,
            name,
            role,
            salary
          FROM employees
          ORDER BY id DESC
        `);

      const payroll =
        result.rows;

      const workbook =
        new ExcelJS.Workbook();

      const worksheet =
        workbook.addWorksheet(
          "Payroll"
        );

      worksheet.columns = [

        {
          header: "Employee Code",
          key: "employee_code",
          width: 20,
        },

        {
          header: "Name",
          key: "name",
          width: 25,
        },

        {
          header: "Role",
          key: "role",
          width: 20,
        },

        {
          header: "Salary",
          key: "salary",
          width: 20,
        },
      ];

      payroll.forEach((p) => {

        worksheet.addRow(p);

      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=payroll.xlsx"
      );

      await workbook.xlsx.write(res);

      res.end();

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };