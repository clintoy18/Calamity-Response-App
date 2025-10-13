// src/routes/earthquakeRoutes.ts
import { Router } from "express";
import { 
  getMostAffectedProvinces,
} from "../controllers/earthquake.controller";

const router = Router();

// ----------------------
// Earthquake Endpoints
// ----------------------

// Get earthquakes from September 30, 10 PM onwards (filtered)
router.get("/most-affected-provinces", getMostAffectedProvinces);


export default router;
