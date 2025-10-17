import { Router } from "express";
import {
  createInfrastructure,
  getAllInfrastructure,
  getInfrastructureById,
  updateInfrastructureStatus,
  deleteInfrastructure,
} from "../controllers/infrastructure.controller";

const router = Router();

router.post("/", createInfrastructure);
router.get("/", getAllInfrastructure);
router.get("/:id", getInfrastructureById);
router.put("/:id/status", updateInfrastructureStatus);
router.delete("/:id", deleteInfrastructure);

export default router;
