import { Material } from "../models/Material.js";

export const getMaterials = async (req, res, next) => {
  try {
    const [rows] = await Material.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const [result] = await Material.create(req.body);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Material.update(id, req.body);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Material.remove(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
