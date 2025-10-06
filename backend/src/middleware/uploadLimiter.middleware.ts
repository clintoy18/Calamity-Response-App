import rateLimit from "express-rate-limit";

export const createUploadLimiter = () => {
  return rateLimit({
    windowMs: 12 * 60 * 60 * 1000, // 12 hours
    max: 1, // 3 requests per window
    message: {
      success: false,
      message: "Too many uploads from this device. Try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // default keyGenerator: uses req.ip for IPv4 and IPv6 correctly
  });
};
