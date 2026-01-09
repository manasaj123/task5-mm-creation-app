import db from "../config/db.js";

export const createGRN = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    const [hRes] = await conn.query(
      `INSERT INTO grn_headers
       (grn_no, grn_date, po_id, vendor_id, location_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        header.grn_no,
        header.grn_date,
        header.po_id,
        header.vendor_id,
        header.location_id,
        header.status || "POSTED"
      ]
    );
    const grnId = hRes.insertId;

    for (const item of items || []) {
      // 1. create batch
      const [bRes] = await conn.query(
        `INSERT INTO batches
         (batch_no, material_id, mfg_date, expiry_date, source_type, source_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.batch_no,
          item.material_id,
          item.mfg_date,
          item.expiry_date,
          "VENDOR",
          header.vendor_id
        ]
      );
      const batchId = bRes.insertId;

      // 2. create grn_item
      await conn.query(
        `INSERT INTO grn_items
         (grn_id, po_item_id, material_id, received_qty, accepted_qty, rejected_qty, batch_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          grnId,
          item.po_item_id,
          item.material_id,
          item.received_qty,
          item.accepted_qty,
          item.rejected_qty,
          batchId
        ]
      );

      // 3. stock ledger entry (in)
      await conn.query(
        `INSERT INTO stock_ledger
         (material_id, location_id, batch_id, txn_type, qty_in, qty_out,
          unit_cost, txn_ref_type, txn_ref_id, txn_date)
         VALUES (?, ?, ?, 'GRN', ?, 0, ?, 'GRN', ?, ?)`,
        [
          item.material_id,
          header.location_id,
          batchId,
          item.accepted_qty,
          item.unit_cost || 0,
          grnId,
          header.grn_date
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ id: grnId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
