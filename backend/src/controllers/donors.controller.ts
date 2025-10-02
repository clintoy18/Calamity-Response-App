import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { DonorRequestBody, DonationType } from "../types/donor.types";

// Get all donors
export const getDonors = async (req: Request, res: Response) => {
  try {
    const donors = await prisma.donor.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get donor by ID
export const getDonorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donor = await prisma.donor.findUnique({ where: { id } });

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    res.json({ success: true, data: donor });
  } catch (error) {
    console.error("Error fetching donor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new donor
export const createDonor = async (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      placename,
      contactno,
      accuracy,
      items,
      availableFrom,
      availableUntil,
      additionalNotes
    }: DonorRequestBody = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one item must be specified" });
    }

    // Optional: check bounds for Cebu
    const isInCebu = latitude >= 9.8 && latitude <= 10.8 &&
                     longitude >= 123.3 && longitude <= 124.4;

    if (!isInCebu) {
      return res.status(400).json({ success: false, message: "Location is outside Cebu area" });
    }

    const newDonor = await prisma.donor.create({
      data: {
        latitude,
        longitude,
        placename,
        contactno,
        accuracy: accuracy || 0,
        items,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        additionalNotes: additionalNotes || ""
      }
    });

    res.status(201).json({ success: true, message: "Donor created successfully", data: newDonor });
  } catch (error) {
    console.error("Error creating donor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update donor info
export const updateDonor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: Partial<DonorRequestBody> = req.body;

    const updatedDonor = await prisma.donor.update({
      where: { id },
      data: {
        ...data,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
        availableUntil: data.availableUntil ? new Date(data.availableUntil) : undefined
      }
    });

    res.json({ success: true, message: "Donor updated successfully", data: updatedDonor });
  } catch (error) {
    console.error("Error updating donor:", error);
    res.status(404).json({ success: false, message: "Donor not found" });
  }
};

// Delete a donor by ID
export const deleteDonorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.donor.delete({ where: { id } });
    res.json({ success: true, message: "Donor deleted successfully" });
  } catch (error) {
    console.error("Error deleting donor:", error);
    res.status(404).json({ success: false, message: "Donor not found" });
  }
};

// Delete all donors
export const deleteAllDonors = async (req: Request, res: Response) => {
  try {
    await prisma.donor.deleteMany();
    res.json({ success: true, message: "All donors deleted successfully" });
  } catch (error) {
    console.error("Error deleting all donors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Filter donors by item type
export const getDonorsByItem = async (req: Request, res: Response) => {
  try {
    const { item } = req.params;
    if (!["food", "water", "medical", "shelter", "clothing", "other"].includes(item)) {
      return res.status(400).json({ success: false, message: "Invalid item type" });
    }

    const donors = await prisma.donor.findMany({
      where: { items: { has: item as DonationType } },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, count: donors.length, data: donors });
  } catch (error) {
    console.error("Error filtering donors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
