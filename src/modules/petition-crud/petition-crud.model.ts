import mongoose from "mongoose";

const PetitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    goal: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    author: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const PetitionModel = mongoose.model("Petition", PetitionSchema);
