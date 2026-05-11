import mongoose from "mongoose";

const PetitionUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    surname: { type: String },
    role: { type: String, enum: ["admin", "petition_user"], default: "petition_user" },
  },
  { timestamps: true },
);

export const PetitionUserModel = mongoose.model(
  "PetitionUser",
  PetitionUserSchema,
);
