import mongoose from "mongoose";
import { PETITION_CATEGORIES } from "./petition-crud.schema.js";

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    shortDescription: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    goal: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      required: true,
      enum: PETITION_CATEGORIES,
      trim: true,
    },
    deadline: { type: Date, required: true },
    votes: { type: Number, default: 0 },
    author: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "closed", "archived"], default: "active" },
  },
  { timestamps: true },
);

export const PetitionModel = mongoose.model("Petition", PetitionSchema);
