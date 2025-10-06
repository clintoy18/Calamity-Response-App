import { Router, Request, Response } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3.config";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// GET /files/presign?key=<s3-key>
router.get("/presign", authenticate, async (req: Request, res: Response) => {
  try {
    const key = req.query.key as string;

    if (!key) {
      return res.status(400).json({ success: false, message: "Missing key" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    res.json({ success: true, url });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ success: false, message: "Could not get file" });
  }
});

export default router;
