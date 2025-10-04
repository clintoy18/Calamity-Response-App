import express from "express";
import { login, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import User from "../models/User";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const router = express.Router();

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
      cb(null, uniqueName);
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

// Routes
router.post("/register", upload.single("verificationDocument"), register);
router.post("/login", login);

router.get("/validate", authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user !== "object" || !("email" in req.user)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userEmail = (req.user as { email: string }).email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ valid: true, user });
  } catch (err) {
    console.error("❌ Error in validate route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
