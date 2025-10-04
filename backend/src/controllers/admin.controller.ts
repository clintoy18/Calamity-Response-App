import { Request, Response } from "express";
import User from "../models/User";


export const approveResponder = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params; // or req.body depending on how you send it

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "User is already approved" });
      return;
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: "User approved successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const fetchResponders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all users with role "respondent"
    const responders = await User.find({ role: "respondent" })
      .select("-password -verificationDocument"); // Exclude sensitive data

    if (!responders || responders.length === 0) {
      res.status(404).json({ message: "No responders found" });
      return;
    }

    res.status(200).json({ responders });
  } catch (error) {
    console.error("Error fetching responders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

