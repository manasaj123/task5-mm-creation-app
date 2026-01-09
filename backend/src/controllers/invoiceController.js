import db from "../config/db.js";
import { Invoice } from "../models/Invoice.js";

export const getInvoices = async (req, res, next) => {
  try {
    const [rows] = await Invoice.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createInvoice = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    const [hRes] = await conn.query(
      `INSERT INTO vendor_invoices
       (invoice_no, invoice_date, vendor_id, po_id, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        header.invoice_no,
        header.invoice_date,
        header.vendor_id,
        header.po_id,
        header.total_amount,
        "PENDING"
      ]
    );
    const invId = hRes.insertId;

    let hasMismatch = false;

    for (const item of items || []) {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;

      // 1) get PO line
      const [[po]] = await conn.query(
        `SELECT qty, price
         FROM po_items
         WHERE id = ?`,
        [item.po_item_id]
      );

      // 2) get total GRN qty for this PO item
      const [[gr]] = await conn.query(
  `SELECT COALESCE(SUM(received_qty), 0) AS grn_qty
   FROM grn_items
   WHERE po_item_id = ?`,
  [item.po_item_id]
);


      const poQty = Number(po?.qty || 0);
      const poPrice = Number(po?.price || 0);
      const grnQty = Number(gr?.grn_qty || 0);

      // 3) basic 3-way matching checks
      const qtyOk = qty <= grnQty && grnQty <= poQty;
      const priceOk = price === poPrice; // or allow tolerance

      if (!qtyOk || !priceOk) {
        hasMismatch = true;
      }

      // 4) insert invoice line
      await conn.query(
        `INSERT INTO invoice_items
         (invoice_id, po_item_id, material_id, qty, price, tax_percent)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invId,
          item.po_item_id,
          item.material_id,
          qty,
          price,
          item.tax_percent || 0
        ]
      );
    }

    // 5) set invoice status based on match result
    const status = hasMismatch ? "MISMATCH" : "VERIFIED";
    await conn.query(
      `UPDATE vendor_invoices
       SET status = ?
       WHERE id = ?`,
      [status, invId]
    );

    await conn.commit();
    res.status(201).json({ id: invId, status });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
