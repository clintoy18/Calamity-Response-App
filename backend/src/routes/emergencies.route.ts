import { Router } from "express";
import {
  getEmergencies,
  getEmergencyById,
  createEmergency,
  updateEmergency,
  deleteEmergencyById,
  deleteAllEmergencies,
  getEmergenciesByUrgency,
  getEmergenciesByStatus
} from "../controllers/emergencies.controller";

const router = Router();

// CRUD Routes
router.get("/", getEmergencies);               // GET all emergencies
router.get("/:id", getEmergencyById);          // GET emergency by id
router.post("/", createEmergency);             // POST new emergency
router.put("/:id", updateEmergency);           // UPDATE status
router.delete("/:id", deleteEmergencyById);    // DELETE one
router.delete("/", deleteAllEmergencies);      // DELETE all

// Filtering Routes
router.get("/filter/urgency/:level", getEmergenciesByUrgency); 
router.get("/filter/status/:status", getEmergenciesByStatus);

export default router;
