import pool from "../db.js";

export const getLedgerEntries = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ledger_entries ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addLedgerEntry = async (req, res) => {
  try {
    const { type, amount, description, currency } = req.body;

    const result = await pool.query(
      `
      INSERT INTO ledger_entries
      (type, amount, description, currency)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [type, amount, description, currency]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deleteLedgerEntry = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM ledger_entries WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};