import pool from "../db.js";
import { createAuditLog } from "../utils/auditLogger.js";
import { createNotification } from "../utils/createNotification.js";

// Get All Purchase Orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM purchase_orders ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to fetch purchase orders",
    });
  }
};

// Add Purchase Order
export const addPurchaseOrder = async (req, res) => {
  try {
    const {
      po_number,
      vendor_name,
      item_name,
      quantity,
      unit_price,
      total_amount,
      order_date,
      expected_delivery,
      status,
      remarks,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO purchase_orders
      (
        po_number,
        vendor_name,
        item_name,
        quantity,
        unit_price,
        total_amount,
        order_date,
        expected_delivery,
        status,
        remarks
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        po_number,
        vendor_name,
        item_name,
        quantity,
        unit_price,
        total_amount,
        order_date,
        expected_delivery,
        status,
        remarks,
      ]
    );

    await createAuditLog(
      "Admin",
      "Purchase Orders",
      `Created Purchase Order ${po_number}`
    );

    await createNotification(
      "Purchase Order Created",
      `Purchase Order ${po_number} has been created.`,
      "success"
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to add purchase order",
    });
  }
};

// Update Purchase Order
export const updatePurchaseOrder = async (req, res) => {
  try {
    const {
      po_number,
      vendor_name,
      item_name,
      quantity,
      unit_price,
      total_amount,
      order_date,
      expected_delivery,
      status,
      remarks,
    } = req.body;

    await pool.query(
      `
      UPDATE purchase_orders
      SET
      po_number=$1,
      vendor_name=$2,
      item_name=$3,
      quantity=$4,
      unit_price=$5,
      total_amount=$6,
      order_date=$7,
      expected_delivery=$8,
      status=$9,
      remarks=$10
      WHERE id=$11
      `,
      [
        po_number,
        vendor_name,
        item_name,
        quantity,
        unit_price,
        total_amount,
        order_date,
        expected_delivery,
        status,
        remarks,
        req.params.id,
      ]
    );

    await createAuditLog(
      "Admin",
      "Purchase Orders",
      `Updated Purchase Order ${po_number}`
    );

    await createNotification(
      "Purchase Order Updated",
      `Purchase Order ${po_number} was updated.`,
      "info"
    );

    res.json({
      success: true,
      message: "Purchase Order Updated Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Update Failed",
    });
  }
};

// Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
  try {

    const purchaseOrder = await pool.query(
      `
      SELECT po_number
      FROM purchase_orders
      WHERE id=$1
      `,
      [req.params.id]
    );

    await pool.query(
      "DELETE FROM purchase_orders WHERE id=$1",
      [req.params.id]
    );

    await createAuditLog(
      "Admin",
      "Purchase Orders",
      `Deleted Purchase Order ${purchaseOrder.rows[0]?.po_number || ""}`
    );

    await createNotification(
      "Purchase Order Deleted",
      `Purchase Order ${purchaseOrder.rows[0]?.po_number || "PO"} was deleted.`,
      "error"
    );

    res.json({
      success: true,
      message: "Purchase Order Deleted",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Delete Failed",
    });

  }
};