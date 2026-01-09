import { Vendor } from "../models/Vendor.js";

export const getVendors = async (req, res, next) => {
  try {
    const [rows] = await Vendor.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const [result] = await Vendor.create(req.body);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Vendor.update(id, req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Vendor.remove(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
