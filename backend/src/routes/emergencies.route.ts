import { Router } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

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
const router = Router();

// Configure S3 client with AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME as string,
    acl: "private",
    key: (req, file, cb) => {
      const uniqueName = Date.now().toString() + "-" + file.originalname;
      cb(null, "emergency-verification/" + uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and image files
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and images are allowed."));
    }
  },
});

// CRUD Routes
router.get("/", getEmergencies); // GET all emergencies
router.get("/:id", getEmergencyById); // GET emergency by id
router.post("/", upload.single("imageVerification"), createEmergency); // POST new emergency
router.put("/:id", authenticate, checkRole("respondent"), updateEmergency);

// Filtering Routes
router.get("/filter/urgency/:level", getEmergenciesByUrgency);
router.get("/filter/status/:status", getEmergenciesByStatus);

export default router;
