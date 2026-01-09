import db from "../config/db.js";

export const Material = {
  findAll() {
    return db.query("SELECT * FROM materials ORDER BY id DESC");
  },

  findById(id) {
    return db.query("SELECT * FROM materials WHERE id = ?", [id]);
  },

  create(data) {
    const {
      name,
      uom,
      shelf_life_days,
      valuation_method,
      issue_type,
      perishable
    } = data;
    return db.query(
      `INSERT INTO materials
       (name, uom, shelf_life_days, valuation_method, issue_type, perishable)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        uom,
        shelf_life_days || 0,
        valuation_method || "MOVING_AVG",
        issue_type || "FIFO",
        perishable ? 1 : 0
      ]
    );
  },

  update(id, data) {
    const {
      name,
      uom,
      shelf_life_days,
      valuation_method,
      issue_type,
      perishable
    } = data;
    return db.query(
      `UPDATE materials SET
         name = ?,
         uom = ?,
         shelf_life_days = ?,
         valuation_method = ?,
         issue_type = ?,
         perishable = ?
       WHERE id = ?`,
      [
        name,
        uom,
        shelf_life_days,
        valuation_method,
        issue_type,
        perishable ? 1 : 0,
        id
      ]
    );
  },

  remove(id) {
    return db.query("DELETE FROM materials WHERE id = ?", [id]);
  }
};
