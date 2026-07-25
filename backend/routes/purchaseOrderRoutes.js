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

    const result = await pool.query(
      "SELECT * FROM purchase_orders ORDER BY id DESC"
    );

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PurchaseOrders.pdf"
    );

    doc.pipe(res);

    doc.fontSize(22).text(
      "Purchase Orders Report",
      {
        align: "center",
      }
    );

    doc.moveDown();

    result.rows.forEach((row) => {

      doc
      .fontSize(12)
      .text(`PO : ${row.po_number}`)
      .text(`Vendor : ${row.vendor_name}`)
      .text(`Item : ${row.item_name}`)
      .text(`Quantity : ${row.quantity}`)
      .text(`Unit Price : ₹${row.unit_price}`)
      .text(`Total : ₹${row.total_amount}`)
      .text(`Status : ${row.status}`)
      .text("--------------------------------");

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

  const workbook = new ExcelJS.Workbook();

  const sheet =
    workbook.addWorksheet("Purchase Orders");

  const result = await pool.query(
    "SELECT * FROM purchase_orders ORDER BY id DESC"
  );

  sheet.columns = [

    {
      header: "PO Number",
      key: "po_number",
      width: 18,
    },

    {
      header: "Vendor",
      key: "vendor_name",
      width: 25,
    },

    {
      header: "Item",
      key: "item_name",
      width: 25,
    },

    {
      header: "Qty",
      key: "quantity",
      width: 10,
    },

    {
      header: "Unit Price",
      key: "unit_price",
      width: 15,
    },

    {
      header: "Total",
      key: "total_amount",
      width: 15,
    },

    {
      header: "Status",
      key: "status",
      width: 15,
    },

    {
      header: "Order Date",
      key: "order_date",
      width: 20,
    },

    {
      header: "Delivery",
      key: "expected_delivery",
      width: 20,
    },

  ];

  sheet.addRows(result.rows);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=PurchaseOrders.xlsx"
  );

  await workbook.xlsx.write(res);

  res.end();

});

export default router;