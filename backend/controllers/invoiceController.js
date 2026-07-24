import pool from "../db.js";

export const getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success:false,
      message:err.message
    });
  }
};

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
        req.params.id,
      ]
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

export const deleteInvoice = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM invoices WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};