import express from "express";

import {
  approveResponder,
  fetchResponders,
} from "../controllers/admin.controller";
import { authenticate, checkRole } from "../middleware/auth.middleware";

const router = express.Router();

router.put(
  "/approve/:userId",
  authenticate,
  checkRole("admin"),
  approveResponder
);
router.get("/", authenticate, checkRole("admin"), fetchResponders);

export default router;
