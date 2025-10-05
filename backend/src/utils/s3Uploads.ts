import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "../config/s3.config";
import { sanitizeFileName } from "./fileNameUtils";

const commonConfig = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only PDF and images are allowed."));
  },
};

// Private upload (e.g. verificationDocument)
export const privateUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME!,
    key: (req, file, cb) => {
      const safeName = sanitizeFileName(file.originalname);
      const uniqueName = `${Date.now()}-${safeName}`;
      cb(null, uniqueName); // no prefix = private by default
    },
  }),
  ...commonConfig,
});

// Public upload (e.g. emergency imageVerification)
export const publicUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME!,
    key: (req, file, cb) => {
      const safeName = sanitizeFileName(file.originalname);
      const uniqueName = `${Date.now()}-${safeName}`;
      cb(null, "public/" + uniqueName);
    },
  }),
  ...commonConfig,
});
