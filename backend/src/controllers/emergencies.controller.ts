import { Request, Response } from "express";
import { EmergencyRequestBody } from "../types/emergency.types";
import Emergency from "../models/Emergency";
import { randomBytes } from "crypto";

// Custom UUID generator
const generateUUID = (): string => {
  return randomBytes(16).toString("hex");
};

// Emergencies CRUD
export const getEmergencies = async (req: Request, res: Response) => {
  try {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // Fetch all emergencies
    const allEmergencies = await Emergency.find().sort({ createdAt: -1 });

    // Filter emergencies within the last 48 hours
    const emergencies = allEmergencies.filter((emergency) => {
      const createdAt = emergency.createdAt;

      // If createdAt is already a Date object
      if (createdAt instanceof Date) {
        return createdAt >= twelveHoursAgo;
      }

      // If createdAt is a string, convert it to Date
      if (typeof createdAt === "string") {
        const createdAtDate = new Date(createdAt);
        // Check if the conversion was successful
        if (!isNaN(createdAtDate.getTime())) {
          return createdAtDate >= twelveHoursAgo;
        }
      }

      // If createdAt is invalid or missing, exclude it
      return false;
    });

    console.log(
      `Total emergencies: ${allEmergencies.length}, Filtered: ${emergencies.length}`
    );

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

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      placename,
      contactno,
      accuracy,
      needs,
      numberOfPeople,
      urgencyLevel,
      additionalNotes,
    }: EmergencyRequestBody = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    if (!needs || needs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one need must be specified",
      });
    }

    // Check if location is in Cebu bounds
    // const isInCebu = latitude >= 9.8 && latitude <= 10.8 &&
    //                  longitude >= 123.3 && longitude <= 124.4;

    // if (!isInCebu) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Location is outside Cebu area'
    //   });
    // }

    const newEmergency = await Emergency.create({
      id: generateUUID(),
      latitude,
      longitude,
      placename,
      contactno,
      accuracy: accuracy || 0,
      timestamp: new Date(),
      needs: needs,
      numberOfPeople: numberOfPeople || 1,
      urgencyLevel: urgencyLevel || "medium",
      additionalNotes: additionalNotes || "",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created successfully",
      data: newEmergency,
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateEmergency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "responded", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, responded, or resolved",
      });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({
      success: true,
      message: "Emergency status updated",
      data: emergency,
    });
  } catch (error) {
    console.error("Error updating emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteEmergencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findByIdAndDelete(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({
      success: true,
      message: "Emergency request deleted",
    });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Filtering
export const getEmergenciesByUrgency = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const filtered = await Emergency.find({ urgencyLevel: level }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error("Error fetching emergencies by urgency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getEmergenciesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const filtered = await Emergency.find({ status }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error("Error fetching emergencies by status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
