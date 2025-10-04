import express from "express";
import { login, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

// Email routes
router.post("/register", register);
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
