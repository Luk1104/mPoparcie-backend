import mongoose from "mongoose";

const VotingSchema = new mongoose.Schema({
  petitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Petition",
    required: true,
  },
  nullifier: { type: String, required: true, unique: true },
  // createdAt: { type: Date, default: Date.now },
});

export const VotingModel = mongoose.model("Votes", VotingSchema);
