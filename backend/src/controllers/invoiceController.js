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

    // 1️⃣ Generate invoice number
    const [rows] = await conn.query(
      `SELECT invoice_no FROM vendor_invoices
       WHERE invoice_no LIKE 'INV-%'
       ORDER BY id DESC LIMIT 1`
    );

    let nextSeq = 1;
    if (rows.length) {
      const num = Number(rows[0].invoice_no.split("-")[1]);
      if (!isNaN(num)) nextSeq = num + 1;
    }
    const invoiceNo = `INV-${String(nextSeq).padStart(3, "0")}`;

    const isGRBased = header.gr_based !== false;

    // 2️⃣ Insert header
    const [hRes] = await Invoice.createHeader(
      {
        ...header,
        invoice_no: invoiceNo,
        status: "PENDING",
        gr_based: isGRBased,
        payment_blocked: header.payment_blocked ? 1 : 0
      },
      conn
    );

    const invoiceId = hRes.insertId;
    let hasMismatch = false;

    // 3️⃣ Process items
    for (const item of items || []) {
      let { po_item_id, material_id, qty, price, tax_percent } = item;

      qty = Number(qty) || 0;
      price = Number(price) || 0;

      // 🔹 If PO item exists → derive material from PO
      if (po_item_id) {
        const [[po]] = await conn.query(
          `SELECT qty, price, material_id
           FROM po_items WHERE id = ?`,
          [po_item_id]
        );

        if (!po) {
          throw new Error(`Invalid PO item: ${po_item_id}`);
        }

        material_id = po.material_id;

        const [[gr]] = await conn.query(
          `SELECT COALESCE(SUM(received_qty),0) grn_qty
           FROM grn_items WHERE po_item_id = ?`,
          [po_item_id]
        );

        const grnQty = Number(gr.grn_qty);
        if (isGRBased && qty > grnQty) hasMismatch = true;
        if (price !== Number(po.price)) hasMismatch = true;
      }

      // 🔴 Final hard validation
      if (!material_id) {
        throw new Error("Material is mandatory for invoice line");
      }

      // 4️⃣ Insert item
      await Invoice.createItem(
        {
          po_item_id: po_item_id || null,
          material_id,
          qty,
          price,
          tax_percent: Number(tax_percent) || 0
        },
        invoiceId,
        conn
      );
    }

    // 5️⃣ Status decision
    let status = "VERIFIED";
    let paymentBlocked = 0;

    if (hasMismatch) {
      status = "BLOCKED_DUE_TO_VARIANCE";
      paymentBlocked = 1;
    }

    if (header.payment_blocked) {
      paymentBlocked = 1;
      if (status === "VERIFIED") status = "BLOCKED_MANUAL";
    }

    await conn.query(
      `UPDATE vendor_invoices
       SET status = ?, payment_blocked = ?
       WHERE id = ?`,
      [status, paymentBlocked, invoiceId]
    );

    await conn.commit();

    res.status(201).json({
      id: invoiceId,
      invoice_no: invoiceNo,
      status,
      payment_blocked: !!paymentBlocked
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};