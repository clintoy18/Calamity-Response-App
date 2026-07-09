import { Router } from "express";
import {
  createAshfallReport,
  getActiveVolcanoAdvisory,
  getAshfallReports,
} from "../controllers/ashfall.controller";

const router = Router();

router.get("/reports", getAshfallReports);
router.post("/reports", createAshfallReport);
router.get("/advisory/active", getActiveVolcanoAdvisory);

export default router;
