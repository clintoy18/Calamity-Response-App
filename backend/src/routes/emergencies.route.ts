import { Router } from "express";
import {
  getEmergencies,
  getEmergencyById,
  createEmergency,
  updateEmergency,
  getEmergenciesByUrgency,
  getEmergenciesByStatus,
} from "../controllers/emergencies.controller";
import { authenticate, checkRole } from "../middleware/auth.middleware";

const router = Router();

// CRUD Routes
router.get("/", getEmergencies); // GET all emergencies
router.get("/:id", getEmergencyById); // GET emergency by id
router.post("/", createEmergency); // POST new emergency
router.put("/:id", authenticate, checkRole("admin"), updateEmergency); // UPDATE status

// Filtering Routes
router.get("/filter/urgency/:level", getEmergenciesByUrgency);
router.get("/filter/status/:status", getEmergenciesByStatus);

export default router;
