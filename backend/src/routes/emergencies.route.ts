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
import { createUploadLimiter } from "../middleware/uploadLimiter.middleware";

const router = Router();
const emergencyVerificationUploadLimiter = createUploadLimiter();

// CRUD Routes
router.get("/", getEmergencies); // GET all emergencies
router.get("/:id", getEmergencyById); // GET emergency by id
router.post(
  "/",
  emergencyVerificationUploadLimiter,
  publicUpload.single("imageVerification"),
  createEmergency
);
router.put("/:id", authenticate, checkRole("respondent"), updateEmergency);

// Filtering Routes
router.get("/filter/urgency/:level", getEmergenciesByUrgency);
router.get("/filter/status/:status", getEmergenciesByStatus);

export default router;
