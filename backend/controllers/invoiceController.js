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
    const { vendor_name, amount, status, due_date } = req.body;

    const result = await pool.query(
      `
      INSERT INTO invoices
      (vendor_name, amount, status, due_date)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [vendor_name, amount, status, due_date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
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