import db from "../config/db.js";

export const Invoice = {
  createHeader(data) {
    const { invoice_no, invoice_date, vendor_id, po_id, total_amount, status } = data;
    return db.query(
      `INSERT INTO vendor_invoices
       (invoice_no, invoice_date, vendor_id, po_id, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoice_no, invoice_date, vendor_id, po_id, total_amount, status || "PENDING"]
    );
  },

  createItem(item, invoiceId) {
    const { po_item_id, material_id, qty, price, tax_percent } = item;
    return db.query(
      `INSERT INTO invoice_items
       (invoice_id, po_item_id, material_id, qty, price, tax_percent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceId, po_item_id, material_id, qty, price, tax_percent || 0]
    );
  },

  findAll() {
    return db.query(
      `SELECT inv.*, v.name AS vendor_name, po.po_no
       FROM vendor_invoices inv
       LEFT JOIN vendors v ON inv.vendor_id = v.id
       LEFT JOIN purchase_orders po ON inv.po_id = po.id
       ORDER BY inv.id DESC`
    );
  }
};
