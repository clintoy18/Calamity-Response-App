import rateLimit from "express-rate-limit";

export const createUploadLimiter = () => {
  return rateLimit({
    windowMs: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    max: 3, // allow 3 requests per window
    message: {
      success: false,
      message: "Too many uploads from this device. Try again later.",
    },
    standardHeaders: true, // send rate limit info in headers
    legacyHeaders: false, // disable X-RateLimit headers
    keyGenerator: (req) => req.ip ?? "unknown-ip", // use IP address as key, fallback if undefined
  });
};
