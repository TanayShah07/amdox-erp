import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const router = express.Router();


router.get("/", async(req,res)=>{

try{

const employees = await pool.query(
"SELECT COUNT(*) FROM employees"
);


const projects = await pool.query(
"SELECT COUNT(*) FROM projects"
);


const inventory = await pool.query(
`
SELECT 
SUM(quantity * unit_price) AS value
FROM inventory
`
);


const invoices = await pool.query(
`
SELECT 
SUM(amount) AS value
FROM invoices
`
);


const ledger = await pool.query(
`
SELECT 
SUM(
CASE 
WHEN type='Credit' THEN amount
ELSE -amount
END
) AS balance
FROM ledger_entries
`
);


res.json({

employees:employees.rows[0].count,
projects:projects.rows[0].count,
inventoryValue:
inventory.rows[0].value || 0,
invoiceValue:
invoices.rows[0].value || 0,
ledgerBalance:
ledger.rows[0].balance || 0
});
}
catch(err){
console.log(err);
res.status(500).json({
message:"Report Error"
});
}
});

router.get("/pdf", async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employees");
    const projects = await pool.query("SELECT COUNT(*) FROM projects");
    const inventory = await pool.query("SELECT SUM(quantity * unit_price) AS value FROM inventory");
    const invoices = await pool.query("SELECT SUM(amount) AS value FROM invoices");
    const ledger = await pool.query(`
      SELECT SUM(
        CASE
          WHEN type='Credit' THEN amount
          ELSE -amount
        END
      ) AS balance
      FROM ledger_entries
    `);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Analytics_Report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(22).text("ERP Analytics Report", {
      align: "center",
    });

    doc.moveDown();
    doc.text(`Generated On: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text(`Employees : ${employees.rows[0].count}`);
    doc.text(`Projects : ${projects.rows[0].count}`);
    doc.text(`Inventory Value : ₹${inventory.rows[0].value || 0}`);
    doc.text(`Invoice Value : ₹${invoices.rows[0].value || 0}`);
    doc.text(`Ledger Balance : ₹${ledger.rows[0].balance || 0}`);

    doc.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "PDF Export Failed",
    });
  }
});

router.get("/excel", async (req, res) => {

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Analytics");

  const employees = await pool.query("SELECT COUNT(*) FROM employees");
  const projects = await pool.query("SELECT COUNT(*) FROM projects");
  const inventory = await pool.query("SELECT SUM(quantity * unit_price) AS value FROM inventory");
  const invoices = await pool.query("SELECT SUM(amount) AS value FROM invoices");
  const ledger = await pool.query(`
      SELECT SUM(
        CASE
          WHEN type='Credit' THEN amount
          ELSE -amount
        END
      ) AS balance
      FROM ledger_entries
  `);

  sheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 30 },
  ];

  sheet.addRows([
    { metric: "Employees", value: employees.rows[0].count },
    { metric: "Projects", value: projects.rows[0].count },
    { metric: "Inventory Value", value: inventory.rows[0].value || 0 },
    { metric: "Invoice Value", value: invoices.rows[0].value || 0 },
    { metric: "Ledger Balance", value: ledger.rows[0].balance || 0 },
  ]);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Analytics_Report.xlsx"
  );

  await workbook.xlsx.write(res);

  res.end();

});

export default router;