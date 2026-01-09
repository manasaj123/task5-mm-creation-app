import db from "../config/db.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";

export const getPOs = async (req, res, next) => {
  try {
    const [rows] = await PurchaseOrder.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getPOById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[header]] = await PurchaseOrder.findById(id);
    const [items] = await PurchaseOrder.findItems(id);
    res.json({ header, items });
  } catch (err) {
    next(err);
  }
};

export const createPO = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    const [hRes] = await conn.query(
      `INSERT INTO purchase_orders
       (po_no, po_date, vendor_id, status, payment_terms, currency)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        header.po_no,
        header.po_date,
        header.vendor_id,
        header.status || "OPEN",
        header.payment_terms,
        header.currency || "INR"
      ]
    );
    const poId = hRes.insertId;

    for (const item of items || []) {
      await conn.query(
        `INSERT INTO po_items
         (po_id, material_id, qty, price, tax_percent, delivery_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          poId,
          item.material_id,
          item.qty,
          item.price,
          item.tax_percent || 0,
          item.delivery_date
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ id: poId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
