import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const router = express.Router();

// EMPLOYEE REPORT
router.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(`
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
      message: "Employee Report Failed",
    });
  }
});

// ATTENDANCE REPORT
router.get("/attendance", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        employee_id,
        employee_name,
        date,
        clock_in,
        clock_out,
        status
      FROM attendance
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Attendance Report Failed",
    });
  }
});

// ATTENDANCE PDF EXPORT

router.get("/attendance/pdf", async (req,res)=>{

  try{

    const result = await pool.query(`
      SELECT *
      FROM attendance
      ORDER BY id DESC
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
    "attachment; filename=Attendance_Report.pdf"
    );


    doc.pipe(res);


    doc
    .fontSize(22)
    .text(
    "Attendance Report",
    {
    align:"center"
    }
    );


    doc.moveDown();


    result.rows.forEach(row=>{


    doc.fontSize(12)
    .text(`Employee ID : ${row.employee_id}`)
    .text(`Employee Name : ${row.employee_name}`)
    .text(`Date : ${row.date}`)
    .text(`Status : ${row.status}`)
    .text("--------------------------------");


    });


    doc.end();


    }catch(err){

    console.log(err);

    res.status(500).json({
    message:"Attendance PDF Failed"
    });


  }

});

// LEAVE REPORT
router.get("/leaves", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM leaves
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Leave Report Failed",
    });
  }
});

router.get("/leaves/pdf", async (req,res)=>{

  try{

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


    doc.fontSize(22)
    .text("AMDOX ERP - Leave Report",
    {
      align:"center"
    });


    doc.moveDown();


    result.rows.forEach(row=>{

      doc.fontSize(12)
      .text(`Employee : ${row.employee_name}`)
      .text(`Leave Type : ${row.leave_type}`)
      .text(`Status : ${row.status}`)
      .text(`From : ${row.from_date}`)
      .text(`To : ${row.to_date}`)
      .text("--------------------------------");

    });


    doc.end();


  }
  catch(err){

    console.log(err);

    res.status(500).json({
      message:"Leave PDF Failed"
    });

  }

});

// PAYROLL REPORT
router.get("/payroll", async (req, res) => {
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
      message: "Payroll Report Failed",
    });
  }
});

// PAYROLL PDF REPORT

router.get("/payroll/pdf", async (req,res)=>{

  try{

    const result = await pool.query(`
      SELECT *
      FROM payroll
      ORDER BY id DESC
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
      "attachment; filename=Payroll_Report.pdf"
    );


    doc.pipe(res);


    doc
    .fontSize(22)
    .text(
      "AMDOX ERP - Payroll Report",
      {
        align:"center"
      }
    );


    doc.moveDown();


    result.rows.forEach(row=>{


      doc
      .fontSize(12)
      .text(`Employee ID : ${row.employee_id}`)
      .text(`Employee Name : ${row.employee_name}`)
      .text(`Basic Salary : ₹${row.basic_salary}`)
      .text(`Bonus : ₹${row.bonus}`)
      .text(`Deductions : ₹${row.deductions}`)
      .text(`Net Salary : ₹${row.net_salary}`)
      .text(`Pay Date : ${row.pay_date}`)
      .text("--------------------------------");


    });


    doc.end();


  }
  catch(err){

    console.log(err);

    res.status(500).json({
      message:"Payroll PDF Failed"
    });

  }

});


// INVOICE REPORT

router.get("/invoices/pdf", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM invoices
      ORDER BY id DESC
    `);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Invoices_Report.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("Invoice Report", {
        align: "center",
      });

    doc.moveDown();

    result.rows.forEach((row) => {

      doc
        .fontSize(12)
        .text(`Invoice : ${row.invoice_number}`)
        .text(`Vendor : ${row.vendor_name}`)
        .text(`Amount : ₹${row.amount}`)
        .text(`Status : ${row.status}`)
        .text(`Due Date : ${row.due_date?.toISOString().split("T")[0]}`)
        .text("--------------------------------------");

    });

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Invoice PDF Export Failed",
    });

  }
});

router.get("/invoices/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Invoices");

    const result = await pool.query(`
      SELECT *
      FROM invoices
      ORDER BY id DESC
    `);

    sheet.columns = [
      { header: "Invoice No", key: "invoice_number", width: 20 },
      { header: "Vendor", key: "vendor_name", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Payment Method", key: "payment_method", width: 20 },
      { header: "GST Number", key: "gst_number", width: 22 },
      { header: "Due Date", key: "due_date", width: 20 },
      { header: "Description", key: "description", width: 35 },
    ];

    sheet.addRows(result.rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Invoices_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Invoice Excel Export Failed",
    });

  }

});

// INVENTORY PDF REPORT

router.get("/inventory/pdf", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM inventory
      ORDER BY id DESC
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
      "attachment; filename=Inventory_Report.pdf"
    );

    doc.pipe(res);

    // HEADER

    doc
      .rect(0,0,doc.page.width,90)
      .fill("#2563EB");

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("AMDOX ERP",40,25);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(
        "Inventory Report",
        40,
        58
      );

    doc.fillColor("black");

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Inventory Details",40,120);

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

    doc.text("Item",40,y);
    doc.text("Category",150,y);
    doc.text("Qty",260,y);
    doc.text("Price",320,y);
    doc.text("Supplier",410,y);

    y+=20;

    doc.moveTo(40,y)
       .lineTo(560,y)
       .stroke();

    y+=10;

    doc.font("Helvetica");

    result.rows.forEach(item=>{

      if(y>740){

        doc.addPage();

        y=50;

      }

      doc.text(item.item_name,40,y);

      doc.text(item.category,150,y);

      doc.text(String(item.quantity),260,y);

      doc.text(
        `$${Number(item.unit_price).toLocaleString()}`,
        320,
        y
      );

      doc.text(item.supplier,410,y);

      y+=25;

    });

    doc.end();

  }

  catch(err){

    console.log(err);

    res.status(500).json({
      message:"PDF Export Failed"
    });

  }

});

router.get("/inventory/excel", async (req,res)=>{

    try{

    const workbook=new ExcelJS.Workbook();

    const sheet=
    workbook.addWorksheet("Inventory");

    const result=await pool.query(`
    SELECT *
    FROM inventory
    ORDER BY id DESC
    `);

    sheet.columns=[

    {header:"Item",key:"item_name",width:25},

    {header:"Category",key:"category",width:20},

    {header:"Quantity",key:"quantity",width:15},

    {header:"Unit Price",key:"unit_price",width:18},

    {header:"Supplier",key:"supplier",width:25},

    {header:"Reorder Level",key:"reorder_level",width:18}

    ];

    sheet.getRow(1).font={
    bold:true
    };

    sheet.getRow(1).fill={
    type:"pattern",
    pattern:"solid",
    fgColor:{argb:"2563EB"}
    };

    sheet.getRow(1).font={
    color:{argb:"FFFFFF"},
    bold:true
    };

    result.rows.forEach(item=>{

    sheet.addRow(item);

    });

    res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
    "Content-Disposition",
    "attachment; filename=Inventory_Report.xlsx"
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

router.get("/ledger/pdf", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM ledger_entries
      ORDER BY created_at DESC
    `);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Ledger_Report.pdf"
    );

    doc.pipe(res);

    // ================= HEADER =================

    doc
      .rect(0, 0, doc.page.width, 90)
      .fill("#1E40AF");

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("AMDOX ERP", 40, 25);

    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Ledger Report", 40, 58);

    doc.fillColor("black");

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Ledger Transactions", 40, 120);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        `Generated On : ${new Date().toLocaleString()}`,
        40,
        150
      );

    let y = 190;

    // Table Header

    doc.font("Helvetica-Bold");

    doc.text("Date", 40, y);
    doc.text("Type", 180, y);
    doc.text("Amount", 270, y);
    doc.text("Description", 380, y);

    y += 20;

    doc.moveTo(40, y).lineTo(560, y).stroke();

    y += 10;

    doc.font("Helvetica");

    result.rows.forEach((row) => {

      if (y > 740) {
        doc.addPage();
        y = 50;
      }

      doc.text(
        new Date(row.created_at).toLocaleDateString(),
        40,
        y
      );

      doc.text(row.type, 180, y);

      doc.text(
        `₹${Number(row.amount).toLocaleString("en-IN")}`,
        270,
        y
      );

      doc.text(
        row.description || "-",
        380,
        y,
        {
          width: 160,
        }
      );

      y += 25;

    });

    doc.end();

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Ledger PDF Failed",
    });
  }
});

router.get("/ledger/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Ledger");

    const result = await pool.query(`
      SELECT *
      FROM ledger_entries
      ORDER BY created_at DESC
    `);

    sheet.columns = [
      { header: "Date", key: "date", width: 18 },
      { header: "Type", key: "type", width: 15 },
      { header: "Amount", key: "amount", width: 18 },
      { header: "Description", key: "description", width: 40 },
    ];

    sheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E40AF" },
    };

    result.rows.forEach((row) => {

      sheet.addRow({
        date: new Date(row.created_at).toLocaleDateString(),
        type: row.type,
        amount: Number(row.amount),
        description: row.description,
      });

    });

    sheet.getColumn("amount").numFmt = '₹#,##0';

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Ledger_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Ledger Excel Failed",
    });

  }

});

export default router;