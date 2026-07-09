import { Schema, model, Document } from "mongoose";

export type AshfallLevel = "LIGHT" | "MODERATE" | "HEAVY";
export type AshfallVisibility = "CLEAR" | "HAZY" | "LOW" | "DANGEROUS";
export type AshfallStatus = "unverified" | "verified" | "archived";

export interface IAshfallReport extends Document {
  id: string;
  latitude: number;
  longitude: number;
  placename: string;
  accuracy: number;
  timestamp: Date;
  ashLevel: AshfallLevel;
  visibility: AshfallVisibility;
  sulfurSmell: boolean;
  needs: string[];
  contactno?: string;
  reporterName?: string;
  additionalNotes?: string;
  status: AshfallStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ashfallReportSchema = new Schema<IAshfallReport>(
  {
    id: { type: String, required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placename: { type: String, required: true },
    accuracy: { type: Number, default: 0 },
    timestamp: { type: Date, required: true },
    ashLevel: {
      type: String,
      enum: ["LIGHT", "MODERATE", "HEAVY"],
      required: true,
    },
    visibility: {
      type: String,
      enum: ["CLEAR", "HAZY", "LOW", "DANGEROUS"],
      default: "HAZY",
    },
    sulfurSmell: { type: Boolean, default: false },
    needs: { type: [String], default: [] },
    contactno: { type: String, default: "" },
    reporterName: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["unverified", "verified", "archived"],
      default: "unverified",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ashfallReportSchema.index({ createdAt: -1 });
ashfallReportSchema.index({ status: 1, createdAt: -1 });
ashfallReportSchema.index({ latitude: 1, longitude: 1 });

export default model<IAshfallReport>("ashfall_report", ashfallReportSchema);
