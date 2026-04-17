import mongoose from "mongoose";

const PetitionUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
  },
  { timestamps: true },
);

export const PetitionUserModel = mongoose.model(
  "PetitionUser",
  PetitionUserSchema,
);
