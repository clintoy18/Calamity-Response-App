import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

export const createUploadLimiter = () => {
  return rateLimit({
    windowMs: 12 * 60 * 60 * 1000, // 12 hours
    max: 3, // 3 requests per window
    message: {
      success: false,
      message: "Too many uploads from this device. Try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => ipKeyGenerator(req as any), // typecast to any
  });
};
