// admin.route.ts
import express from "express";
import {
  approveResponder,
  fetchResponders,
  fetchEmergencies,
  fetchEmergencyCountByCity,
  verifyEmergencyRequest,
  getEmergencyById,
  deleteEmergencyById, 
  unverifyEmergency,
  // rejectResponders, // uncomment if implemented
} from "../controllers/admin.controller";
import { authenticate, checkRole } from "../middleware/auth.middleware";

const router = express.Router();

// ----------------------
// RESPONDERS ROUTES
// ----------------------
// Fetch responders with pagination: ?page=1&limit=20
router.get(
  "/responders",
  authenticate,
  checkRole("admin"),
  fetchResponders
);

// Approve a responder
router.put(
  "/responders/:userId/approve",
  authenticate,
  checkRole("admin"),
  approveResponder
);

// Reject responder (optional)
// router.put(
//   "/responders/:userId/reject",
//   authenticate,
//   checkRole("admin"),
//   rejectResponders
// );

// ----------------------
// EMERGENCIES ROUTES
// ----------------------
// Fetch emergencies with pagination: ?page=1&limit=20
router.get(
  "/emergencies",
  authenticate,
  checkRole("admin"),
  fetchEmergencies
);

// Fetch emergency counts by city (paginated): ?page=1&limit=20
router.get(
  "/emergencies/lgu",
  authenticate,
  checkRole("admin"),
  fetchEmergencyCountByCity
);

// Get a single emergency by ID
router.get(
  "/emergencies/:id",
  authenticate,
  checkRole("admin"),
  getEmergencyById
);

// Approve/verify an emergency
router.put(
  "/emergencies/:id/approve",
  authenticate,
  checkRole("admin"),
  verifyEmergencyRequest
);

router.delete(
  "/emergencies/:id/delete",
  authenticate,
  checkRole("admin"),
  deleteEmergencyById
)

router.put(
  "/emergencies/:id/unverify",
   authenticate,
  checkRole("admin"),
 unverifyEmergency);



export default router;
