import express from "express";

import {
  approveResponder,
  fetchResponders,
  fetchEmergencies,
  fetchEmergencyCountByCity,
  verifyEmergencyRequest,
  getEmergencyById,
//   rejectResponder,
} from "../controllers/admin.controller";
import { authenticate, checkRole } from "../middleware/auth.middleware";

const router = express.Router();


//emergencies
router.get("/emergencies", authenticate,checkRole("admin"),fetchEmergencies);
router.get("/emergencies/lgu",authenticate, checkRole("admin"),fetchEmergencyCountByCity);
router.get("/:id", authenticate, checkRole("admin"),getEmergencyById);
router.put("/emergencies/:id/approve", authenticate, checkRole("admin"),verifyEmergencyRequest);

//responders
// router.put("/reject/:userId", rejectResponder); // REJECT responder
router.get("/", authenticate, checkRole("admin"), fetchResponders);
router.put("/approve/:userId", authenticate,checkRole("admin"),approveResponder);


export default router;
