import { Schema, model, Document } from "mongoose";

// TypeScript interface
export interface IEmergency extends Document {
  id: string;
  latitude: number;
  longitude: number;
  placename: string;
  contactno?: string;
  contactName?: string; 
  accuracy: number;
  timestamp: Date;
  needs: string[];
  numberOfPeople: number;
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  additionalNotes?: string;
  status: "pending" | "in-progress" | "responded";
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  imageVerification: string;
  messengerUserId?: string; // Track which messenger user submitted this
  lastNotifiedStatus?: "verified" | "in-progress" | "responded"; // NEW: Track last notification sent
  suspiciousFlags?: string[]; // NEW: Track suspicious patterns

}

// Schema definition
const emergencySchema = new Schema<IEmergency>(
  {
    id: { type: String, required: true, unique: true }, // UUID
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placename: { type: String, required: true },
    contactno: { type: String, default: "" },
    contactName: { type: String, default: "" },
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
      enum: ["pending", "in-progress", "responded"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    imageVerification: { type: String }, // URL or path to the image
    messengerUserId: { type: String },
    lastNotifiedStatus: { // NEW: Simple tracking of last notification
      type: String,
      enum: ["verified", "in-progress", "responded"],
    },
  },
  { timestamps: true } // Auto-manages createdAt & updatedAt
);

// Index for quick lookups by messenger user
emergencySchema.index({ messengerUserId: 1, createdAt: -1 });

export default model<IEmergency>("emergency", emergencySchema);
