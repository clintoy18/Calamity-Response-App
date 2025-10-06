import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    // ✅ Check if user still exists and is verified
    const user = await User.findById(payload.id).select(
      "isVerified role email"
    );

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: "Account not verified. Access denied.",
        code: "ACCOUNT_NOT_VERIFIED",
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Access denied. You do not have permission to access this resource.",
      });
    }

    next();
  };
};
