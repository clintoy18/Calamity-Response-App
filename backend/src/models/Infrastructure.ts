import { Schema, model, Document } from "mongoose";

export enum InfrastructureType {
  BRIDGE = "Bridge",
  ROAD = "Road",
  SCHOOL = "School",
  HOSPITAL = "Hospital",
  OTHER = "Other",
}

export enum InfrastructureStatus {
  UNASSESSED = "unassessed",
  ASSESSED_DAMAGED = "assessed-damaged",
  ASSESSED_PASSABLE = "assessed-passable",
  UNDER_REPAIR = "under-repair",
  REPAIRED = "repaired",
  DESTROYED = "destroyed",
}

export interface InfrastructureDocument extends Document {
  id: string;
  type: InfrastructureType;
  name: string;
  latitude: number;
  longitude: number;
  status: InfrastructureStatus;
  additionalNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const infrastructureSchema = new Schema<InfrastructureDocument>(
  {
    id: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: Object.values(InfrastructureType),
      required: true,
    },
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(InfrastructureStatus),
      default: InfrastructureStatus.UNASSESSED,
    },
    additionalNotes: { type: String },
    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default model<InfrastructureDocument>(
  "Infrastructure",
  infrastructureSchema
);
