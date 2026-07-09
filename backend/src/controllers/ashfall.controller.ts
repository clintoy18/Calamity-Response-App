import { Request, Response } from "express";
import { randomBytes } from "crypto";
import AshfallReport, {
  AshfallLevel,
  AshfallStatus,
  AshfallVisibility,
} from "../models/AshfallReport";
import VolcanoAdvisory from "../models/VolcanoAdvisory";

const generateUUID = (): string => randomBytes(16).toString("hex");

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    }

    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const normalizeAshLevel = (value: unknown): AshfallLevel | null => {
  const normalized = String(value || "").trim().toUpperCase();
  if (["LIGHT", "MODERATE", "HEAVY"].includes(normalized)) {
    return normalized as AshfallLevel;
  }
  return null;
};

const normalizeVisibility = (value: unknown): AshfallVisibility => {
  const normalized = String(value || "").trim().toUpperCase();
  if (["CLEAR", "HAZY", "LOW", "DANGEROUS"].includes(normalized)) {
    return normalized as AshfallVisibility;
  }
  return "HAZY";
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

export const getAshfallReports = async (req: Request, res: Response) => {
  try {
    const hours = Math.min(Math.max(Number(req.query.hours) || 72, 1), 168);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const reports = await AshfallReport.find({
      createdAt: { $gte: since },
      status: { $ne: "archived" },
    })
      .sort({ isVerified: -1, createdAt: -1 })
      .select("-__v")
      .lean();

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching ashfall reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createAshfallReport = async (req: Request, res: Response) => {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const ashLevel = normalizeAshLevel(req.body.ashLevel);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !ashLevel) {
      return res.status(400).json({
        success: false,
        message: "Latitude, longitude, and ash level are required",
      });
    }

    const report = await AshfallReport.create({
      id: generateUUID(),
      latitude,
      longitude,
      placename: String(req.body.placename || "Unknown location"),
      accuracy: Number(req.body.accuracy) || 0,
      timestamp: new Date(),
      ashLevel,
      visibility: normalizeVisibility(req.body.visibility),
      sulfurSmell: normalizeBoolean(req.body.sulfurSmell),
      needs: normalizeStringArray(req.body.needs),
      contactno: String(req.body.contactno || ""),
      reporterName: String(req.body.reporterName || ""),
      additionalNotes: String(req.body.additionalNotes || ""),
      status: "unverified",
      isVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "Ashfall report submitted",
      data: report,
    });
  } catch (error) {
    console.error("Error creating ashfall report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getActiveVolcanoAdvisory = async (_req: Request, res: Response) => {
  try {
    const advisory = await VolcanoAdvisory.findOne({ status: "active" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select("-__v")
      .lean();

    res.json({
      success: true,
      data: advisory,
    });
  } catch (error) {
    console.error("Error fetching active volcano advisory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchAshfallReportsForAdmin = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const query: Record<string, unknown> = {};

    if (status && ["unverified", "verified", "archived"].includes(status)) {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      AshfallReport.find(query)
        .sort({ isVerified: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      AshfallReport.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching admin ashfall reports:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching ashfall reports.",
      data: [],
    });
  }
};

export const updateAshfallReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || "").trim() as AshfallStatus;

    if (!["unverified", "verified", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be unverified, verified, or archived",
      });
    }

    const report = await AshfallReport.findOneAndUpdate(
      { id },
      {
        status,
        isVerified: status === "verified",
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Ashfall report not found",
      });
    }

    res.json({
      success: true,
      message: "Ashfall report updated",
      data: report,
    });
  } catch (error) {
    console.error("Error updating ashfall report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createVolcanoAdvisory = async (req: Request, res: Response) => {
  try {
    const title = String(req.body.title || "").trim();
    const summary = String(req.body.summary || "").trim();
    const sourceName = String(req.body.sourceName || "").trim();

    if (!title || !summary || !sourceName) {
      return res.status(400).json({
        success: false,
        message: "Title, summary, and source name are required",
      });
    }

    await VolcanoAdvisory.updateMany(
      { status: "active" },
      { status: "expired", updatedAt: new Date() }
    );

    const advisory = await VolcanoAdvisory.create({
      id: generateUUID(),
      volcanoName: String(req.body.volcanoName || "Kanlaon Volcano"),
      title,
      alertLevel: String(req.body.alertLevel || ""),
      sourceName,
      sourceUrl: String(req.body.sourceUrl || ""),
      affectedAreas: normalizeStringArray(req.body.affectedAreas),
      summary,
      instructions: normalizeStringArray(req.body.instructions),
      status: "active",
      publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : new Date(),
      createdBy: req.user?.id || "",
    });

    res.status(201).json({
      success: true,
      message: "Volcano advisory published",
      data: advisory,
    });
  } catch (error) {
    console.error("Error creating volcano advisory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const expireVolcanoAdvisory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const advisory = await VolcanoAdvisory.findOneAndUpdate(
      { id },
      { status: "expired", updatedAt: new Date() },
      { new: true }
    );

    if (!advisory) {
      return res.status(404).json({
        success: false,
        message: "Volcano advisory not found",
      });
    }

    res.json({
      success: true,
      message: "Volcano advisory expired",
      data: advisory,
    });
  } catch (error) {
    console.error("Error expiring volcano advisory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
