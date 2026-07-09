import { Schema, model, Document } from "mongoose";

export type VolcanoAdvisoryStatus = "active" | "expired";

export interface IVolcanoAdvisory extends Document {
  id: string;
  volcanoName: string;
  title: string;
  alertLevel?: string;
  sourceName: string;
  sourceUrl?: string;
  affectedAreas: string[];
  summary: string;
  instructions: string[];
  status: VolcanoAdvisoryStatus;
  publishedAt: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const volcanoAdvisorySchema = new Schema<IVolcanoAdvisory>(
  {
    id: { type: String, required: true, unique: true },
    volcanoName: { type: String, required: true, default: "Kanlaon Volcano" },
    title: { type: String, required: true },
    alertLevel: { type: String, default: "" },
    sourceName: { type: String, required: true },
    sourceUrl: { type: String, default: "" },
    affectedAreas: { type: [String], default: [] },
    summary: { type: String, required: true },
    instructions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    publishedAt: { type: Date, required: true },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

volcanoAdvisorySchema.index({ status: 1, publishedAt: -1 });

export default model<IVolcanoAdvisory>("volcano_advisory", volcanoAdvisorySchema);
