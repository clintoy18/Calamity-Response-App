import { Request, Response } from "express";
import { EmergencyRequestBody } from "../types/emergency.types";
import Emergency from "../models/Emergency";
import { randomBytes } from "crypto";

// Custom UUID generator
const generateUUID = (): string => {
  return randomBytes(16).toString("hex");
};

// -----------------
// GET all emergencies (last 24h, filtered)
export const getEmergencies = async (req: Request, res: Response) => {
  try {
    // Only fetch emergencies that are verified  isVerified: true
    const emergencies = await Emergency.find({ })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// -----------------
// GET emergency by UUID
export const getEmergencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findOne({ id });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({ success: true, data: emergency });
  } catch (error) {
    console.error("Error fetching emergency:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// CREATE emergency
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

    const file = req.file as Express.MulterS3.File;

    if (!file) {
      return res.status(400).json({ message: "Verification document is required" });
    }

    if (!latitude || !longitude || !needs || needs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Latitude, longitude, and needs are required",
      });
    }

    const newEmergency = await Emergency.create({
      id: generateUUID(),
      latitude,
      longitude,
      placename,
      contactno: contactno || "",
      accuracy: accuracy || 0,
      timestamp: new Date(),
      needs,
      numberOfPeople: numberOfPeople || 1,
      urgencyLevel: urgencyLevel || "MEDIUM",
      additionalNotes: additionalNotes || "",
      status: "pending",
      isVerified: false,
      imageVerification: file.location,
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created successfully",
      data: newEmergency,
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// UPDATE emergency status
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

    const emergency = await Emergency.findOneAndUpdate(
      { id }, // query by UUID
      { status, updatedAt: new Date() },
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// DELETE emergency by UUID
export const deleteEmergencyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findOneAndDelete({ id });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.json({ success: true, message: "Emergency request deleted" });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// GET emergencies by urgency
export const getEmergenciesByUrgency = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const filtered = await Emergency.find({ urgencyLevel: level }).sort({ createdAt: -1 });

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error("Error fetching emergencies by urgency:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------
// GET emergencies by status
export const getEmergenciesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const filtered = await Emergency.find({ status }).sort({ createdAt: -1 });

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error("Error fetching emergencies by status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
