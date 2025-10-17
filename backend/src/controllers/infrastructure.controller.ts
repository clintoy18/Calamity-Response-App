import { Request, Response } from "express";
import Infrastructure, { InfrastructureStatus } from "../models/Infrastructure";
import { randomBytes } from "crypto";

// Generate UUID
const generateUUID = (): string => randomBytes(16).toString("hex");

// ---------------------------
// CREATE new infrastructure pin
export const createInfrastructure = async (req: Request, res: Response) => {
  try {
    const { type, name, latitude, longitude, additionalNotes } = req.body;

    if (!type || !name || latitude === undefined || longitude === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newInfra = await Infrastructure.create({
      id: generateUUID(),
      type,
      name,
      latitude,
      longitude,
      status: InfrastructureStatus.UNASSESSED,
      additionalNotes,
    });

    res.status(201).json({ success: true, data: newInfra });
  } catch (error: any) {
    console.error("Error creating infrastructure:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------
// GET all infrastructure pins
export const getAllInfrastructure = async (req: Request, res: Response) => {
  try {
    const infra = await Infrastructure.find({ isDeleted: false }) 
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: infra.length, data: infra });
  } catch (error: any) {
    console.error("Error fetching infrastructure:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ---------------------------
// ✅ GET single infrastructure by ID
export const getInfrastructureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const infra = await Infrastructure.findOne({ id });

    if (!infra) {
      return res
        .status(404)
        .json({ success: false, message: "Infrastructure not found" });
    }

    res.json({ success: true, data: infra });
  } catch (error: any) {
    console.error("Error fetching infrastructure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// UPDATE infrastructure status and notes
export const updateInfrastructureStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, additionalNotes } = req.body;

    // Validate if a valid status is provided (optional)
    if (status && !Object.values(InfrastructureStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(InfrastructureStatus).join(", ")}`,
      });
    }

    // Build dynamic update object
    const updateFields: any = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (additionalNotes !== undefined) updateFields.additionalNotes = additionalNotes;

    const infra = await Infrastructure.findOneAndUpdate(
      { id },
      updateFields,
      { new: true }
    );

    if (!infra) {
      return res.status(404).json({ success: false, message: "Infrastructure not found" });
    }

    res.json({
      success: true,
      message: "Infrastructure updated successfully",
      data: infra,
    });
  } catch (error: any) {
    console.error("Error updating infrastructure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// SOFT DELETE infrastructure
export const deleteInfrastructure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const infra = await Infrastructure.findOneAndUpdate(
      { id },
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!infra) {
      return res.status(404).json({ success: false, message: "Infrastructure not found" });
    }

    res.json({ success: true, message: "Infrastructure marked as deleted", data: infra });
  } catch (error: any) {
    console.error("Error soft deleting infrastructure:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

