import express from "express";
import { getPOs, getPOById, createPO } from "../controllers/poController.js";

const router = express.Router();

router.get("/", getPOs);
router.get("/:id", getPOById);
router.post("/", createPO);

export default router;
