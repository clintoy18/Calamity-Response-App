import { Router } from "express";
import {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonorById,
  deleteAllDonors,
  getDonorsByItem,
  
} from "../controllers/donors.controller";

const router = Router();

// CRUD Routes
router.get("/", getDonors);                  // GET all donors
router.get("/:id", getDonorById);           // GET donor by id
router.post("/", createDonor);              // POST new donor
router.put("/:id", updateDonor);            // UPDATE donor info
router.delete("/:id", deleteDonorById);     // DELETE one donor
router.delete("/", deleteAllDonors);        // DELETE all donors

// Filtering Routes
router.get("/filter/item/:item", getDonorsByItem);             // Filter donors by item type

export default router;
