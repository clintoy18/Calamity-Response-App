import { Request, Response } from "express";
import User from "../models/User";
import Emergency from "../models/Emergency";

export const approveResponder = async (
  req: Request,
  res: Response
): Promise<void> => {
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


export const verifyEmergencyRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and update the emergency to set isVerified = true
    const emergency = await Emergency.findByIdAndUpdate(
      id,
      { isVerified: true, updatedAt: new Date() },
      { new: true, runValidators: false } // skip other required field validations
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({
      success: true,
      message: "Emergency verified successfully",
      data: {
        id: emergency._id,
        placename: emergency.placename,
        needs: emergency.needs,
        isVerified: emergency.isVerified,
        updatedAt: emergency.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error verifying emergency:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const fetchResponders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch all users with role "respondent"
    const responders = await User.find({ role: "respondent" }).select(
      "-password"
    ); // Exclude sensitive data

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
//reject responders
export const rejectResponders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params; // or req.body depending on how you send it

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "User is rejected already"});
      return;
    }

    user.isVerified = false;
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

// Emergencies CRUD
export const fetchEmergencies = async (req: Request, res: Response) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const emergencies = await Emergency.find({
      $or: [
        { dataQualityIssues: { $exists: false } },
        { dataQualityIssues: "OK" },
      ],
    }).sort({ createdAt: -1 });

    console.log(`Filtered emergencies count: ${emergencies.length}`);

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get emergency by id
export const getEmergencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({
      success: true,
      data: emergency,
    });
  } catch (error) {
    console.error("Error fetching emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Fetch count of emergencies grouped by city/municipality
export const fetchEmergencyCountByCity = async (req: Request, res: Response) => {
  try {
    const results = await Emergency.aggregate([
      {
        $match: {
          $or: [
            { dataQualityIssues: { $exists: false } },
            { dataQualityIssues: "OK" },
          ],
        },
      },
      {
        // Extract city/municipality name from placename
        $project: {
          city: {
            $arrayElemAt: [
              { $split: ["$placename", ", "] },
              2, // adjust this index depending on your address format
            ],
          },
        },
      },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 }, // highest first
      },
    ]);

    const formatted = results.map((r) => ({
      city: r._id || "Unknown",
      count: r.count,
    }));

    console.log("Emergency counts by city:", formatted);

    res.json({
      success: true,
      message: "Emergency counts by city/municipality",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching emergency counts by city:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching emergency counts by city",
    });
  }
};



