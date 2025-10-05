import { Router } from "express";

import {
  getEmergencies,
  getEmergencyById,
  createEmergency,
  updateEmergency,
  deleteEmergencyById,
  getEmergenciesByUrgency,
  getEmergenciesByStatus,
} from "../controllers/emergencies.controller";
import { authenticate, checkRole } from "../middleware/auth.middleware";
import { publicUpload } from "../utils/s3Uploads";

const router = Router();

// CRUD Routes
router.get("/", getEmergencies); // GET all emergencies
router.get("/:id", getEmergencyById); // GET emergency by id
router.post("/", publicUpload.single("imageVerification"), createEmergency); // POST new emergency
router.put("/:id", authenticate, checkRole("respondent"), updateEmergency);

// Filtering Routes
router.get("/filter/urgency/:level", getEmergenciesByUrgency);
router.get("/filter/status/:status", getEmergenciesByStatus);

export default router;
