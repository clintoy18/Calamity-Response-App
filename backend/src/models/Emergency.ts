import { Schema, model, Document } from "mongoose";

// TypeScript interface
export interface IEmergency extends Document {
  id: string;
  latitude: number;
  longitude: number;
  placename: string;
  contactno?: string;
  accuracy: number;
  timestamp: Date;
  needs: string[];
  numberOfPeople: number;
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  additionalNotes?: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  imageVerification: string;
}

// Schema definition
const emergencySchema = new Schema<IEmergency>(
  {
    id: { type: String, required: true, unique: true }, // UUID
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placename: { type: String, required: true },
    contactno: { type: String, default: "" },
    accuracy: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    needs: { type: [String], required: true }, // Array of needs (food, water, medical, etc.)
    numberOfPeople: { type: Number, required: true },
    urgencyLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    additionalNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    imageVerification: { type: String }, // URL or path to the image
  },
  { timestamps: true } // Auto-manages createdAt & updatedAt
);

export default model<IEmergency>("emergency", emergencySchema);
