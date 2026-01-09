import db from "../config/db.js";
import { PurchaseRequisition } from "../models/PurchaseRequisition.js";

export const getPRs = async (req, res, next) => {
  try {
    const [rows] = await PurchaseRequisition.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createPR = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { header, items } = req.body;
    await conn.beginTransaction();

    const [hRes] = await conn.query(
      `INSERT INTO purchase_requisitions (req_no, req_date, requester, status)
       VALUES (?, ?, ?, ?)`,
      [header.req_no, header.req_date, header.requester, header.status || "DRAFT"]
    );
    const prId = hRes.insertId;

    for (const item of items || []) {
      await conn.query(
        `INSERT INTO pr_items
         (pr_id, material_id, qty, required_date, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [prId, item.material_id, item.qty, item.required_date, item.remarks]
      );
    }

    await conn.commit();
    res.status(201).json({ id: prId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
