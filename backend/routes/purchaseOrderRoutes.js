import express from "express";
import pool from "../db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import {
  getPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "../controllers/purchaseOrderController.js";

const router = express.Router();

router.get("/", getPurchaseOrders);

router.post("/", addPurchaseOrder);

router.put("/:id", updatePurchaseOrder);

router.delete("/:id", deletePurchaseOrder);

router.get("/pdf", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM purchase_orders
      ORDER BY id DESC
    `);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PurchaseOrders_Report.pdf"
    );

    doc.pipe(res);

    // HEADER

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
      .text("Purchase Orders Report", 40, 58);

    doc.fillColor("black");

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("Purchase Orders", 40, 120);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        `Generated On : ${new Date().toLocaleString()}`,
        40,
        150
      );

    let y = 190;

    // TABLE HEADER

    doc.font("Helvetica-Bold");

    doc.text("PO No", 40, y);
    doc.text("Vendor", 120, y);
    doc.text("Item", 230, y);
    doc.text("Qty", 330, y);
    doc.text("Total", 380, y);
    doc.text("Status", 470, y);

    y += 20;

    doc.moveTo(40, y).lineTo(560, y).stroke();

    y += 10;

    doc.font("Helvetica");

    result.rows.forEach((row) => {

      if (y > 740) {
        doc.addPage();
        y = 50;

        doc.font("Helvetica-Bold");
        doc.text("PO No", 40, y);
        doc.text("Vendor", 120, y);
        doc.text("Item", 230, y);
        doc.text("Qty", 330, y);
        doc.text("Total", 380, y);
        doc.text("Status", 470, y);

        y += 20;

        doc.moveTo(40, y).lineTo(560, y).stroke();

        y += 10;

        doc.font("Helvetica");
      }

      doc.text(row.po_number || "-", 40, y);

      doc.text(row.vendor_name || "-", 120, y, {
        width: 90,
      });

      doc.text(row.item_name || "-", 230, y, {
        width: 80,
      });

      doc.text(String(row.quantity), 330, y);

      doc.text(
        `₹${Number(row.total_amount).toLocaleString("en-IN")}`,
        380,
        y
      );

      doc.text(row.status, 470, y);

      y += 25;

    });

    doc.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "PDF Export Failed",
    });

  }
});

router.get("/excel", async (req, res) => {

  try {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "AMDOX ERP";

    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Purchase Orders");

    const result = await pool.query(`
      SELECT *
      FROM purchase_orders
      ORDER BY id DESC
    `);

    sheet.columns = [
      { header: "PO Number", key: "po_number", width: 18 },
      { header: "Vendor", key: "vendor_name", width: 24 },
      { header: "Item", key: "item_name", width: 22 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Unit Price", key: "unit_price", width: 16 },
      { header: "Total Amount", key: "total_amount", width: 18 },
      { header: "Status", key: "status", width: 15 },
      { header: "Order Date", key: "order_date", width: 18 },
      { header: "Expected Delivery", key: "expected_delivery", width: 20 },
    ];

    sheet.getRow(1).height = 25;

    sheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E40AF" },
    };

    sheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    result.rows.forEach((row) => {

      sheet.addRow({
        po_number: row.po_number,
        vendor_name: row.vendor_name,
        item_name: row.item_name,
        quantity: row.quantity,
        unit_price: Number(row.unit_price),
        total_amount: Number(row.total_amount),
        status: row.status,
        order_date: row.order_date
          ? new Date(row.order_date).toLocaleDateString()
          : "",
        expected_delivery: row.expected_delivery
          ? new Date(row.expected_delivery).toLocaleDateString()
          : "",
      });

    });

    sheet.getColumn("unit_price").numFmt = '₹#,##0';

    sheet.getColumn("total_amount").numFmt = '₹#,##0';

    sheet.eachRow((row) => {

      row.eachCell((cell) => {

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PurchaseOrders_Report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Excel Export Failed",
    });

  }

});

export default router;