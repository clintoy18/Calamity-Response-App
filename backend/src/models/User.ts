import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  fullName?: string;
  contactNo?: string;
  verificationDocument?: string;
  role?: string;
  notes?: string;
  isVerified?: boolean;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    contactNo: { type: String, required: true },
    verificationDocument: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["respondent", "admin"],
      default: "respondent",
    },
    notes: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Don't return password in queries by default
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
