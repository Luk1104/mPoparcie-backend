import mongoose from "mongoose";
import { time } from "node:console";

const zkpCommitmentSchema = new mongoose.Schema(
  {
    commitment: {
      type: String,
      required: true,
      unique: true,
      // Opcjonalnie: walidacja w bazie (juz jest w schema)
      match: [/^\d+$/, "Commitment musi być ciągiem cyfr"],
    },
    index: {
      type: Number,
      required: true,
    },
    groupId: {
      type: String,
      required: true,
      default: "1",
    },
  },
);

//Tworzymy indeks złożony, aby upewnić się, że nikt nie zajmie tego samego miejsca w drzewie
zkpCommitmentSchema.index({ groupId: 1, index: 1 }, { unique: true });

const zkpMetadataSchema = new mongoose.Schema({
  groupId: { type: String, required: true, default: "1" },
  currentRoot: { type: String, required: true },
  lastIndex: { type: Number, required: true, default: -1 },
},
  {timestamps: true},
);

export const ZkpMetadataModel = mongoose.model(
  "ZkpRoots",
  zkpMetadataSchema,
);
export const ZkpCommitmentModel = mongoose.model(
  "MerkleTree",
  zkpCommitmentSchema,
);
