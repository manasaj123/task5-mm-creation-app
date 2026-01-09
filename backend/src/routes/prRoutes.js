import express from "express";
import { getPRs, createPR } from "../controllers/prController.js";

const router = express.Router();

router.get("/", getPRs);
router.post("/", createPR);

export default router;
