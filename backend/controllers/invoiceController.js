import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

// GET ALL INVOICES
export const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ADD INVOICE
export const addInvoice = async (req, res) => {
  try {

    const {
      invoice_number,
      vendor_name,
      amount,
      status,
      due_date,
      payment_method,
      gst_number,
      description
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO invoices
      (
        invoice_number,
        vendor_name,
        amount,
        status,
        due_date,
        payment_method,
        gst_number,
        description
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        invoice_number,
        vendor_name,
        amount,
        status,
        due_date,
        payment_method,
        gst_number,
        description
      ]
    );

    await createAuditLog(
      "Admin",
      "Invoices",
      `Created Invoice ${invoice_number}`
    );

    await createNotification(
      "Invoice Created",
      `Invoice ${invoice_number} was created successfully.`,
      "success"
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// UPDATE INVOICE
export const updateInvoice = async (req, res) => {
  try {

    const {
      invoice_number,
      vendor_name,
      amount,
      status,
      due_date,
      payment_method,
      gst_number,
      description
    } = req.body;

    await pool.query(
      `
      UPDATE invoices
      SET
        invoice_number=$1,
        vendor_name=$2,
        amount=$3,
        status=$4,
        due_date=$5,
        payment_method=$6,
        gst_number=$7,
        description=$8
      WHERE id=$9
      `,
      [
        invoice_number,
        vendor_name,
        amount,
        status,
        due_date,
        payment_method,
        gst_number,
        description,
        req.params.id
      ]
    );

    await createAuditLog(
      "Admin",
      "Invoices",
      `Updated Invoice ${invoice_number}`
    );

    await createNotification(
      "Invoice Updated",
      `Invoice ${invoice_number} was updated successfully.`,
      "info"
    );

    res.json({
      success: true,
      message: "Invoice Updated Successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Update Failed",
    });

  }
};

// DELETE INVOICE
export const deleteInvoice = async (req, res) => {
  try {

    const invoice = await pool.query(
      `
      SELECT invoice_number
      FROM invoices
      WHERE id=$1
      `,
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM invoices WHERE id=$1",
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Invoices",
      `Deleted Invoice ${invoice.rows[0]?.invoice_number || ""}`
    );

    await createNotification(
      "Invoice Deleted",
      `Invoice ${invoice.rows[0]?.invoice_number || "Invoice"} was deleted.`,
      "error"
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message,
    });

  }
};