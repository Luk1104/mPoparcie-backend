import mongoose from "mongoose";
import cron from "node-cron";

import { BucketScaler } from "./merkle-tree-functions.js";

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
    },
  },
);

//Tworzymy indeks złożony, aby upewnić się, że nikt nie zajmie tego samego miejsca w drzewie
zkpCommitmentSchema.index({ groupId: 1, index: 1 }, { unique: true });

const zkpBucketSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  currentRoot: { type: String, required: true },
  lastIndex: { type: Number, required: true, default: -1 },
},
  {timestamps: true},
);

export const ZkpBucketsModel = mongoose.model(
  "ZkpBuckets",
  zkpBucketSchema,
);
export const ZkpCommitmentModel = mongoose.model(
  "ZkpCommitments",
  zkpCommitmentSchema,
);

//cron job

// Run every day at midnight (server local time)
// Niewiem czy trzeba wszedzie tu dać async.await, ale wydaj mi sie że ma być blokujące
// cron testowy - co minutę, żeby szybciej sprawdzić czy działa
// powinno być 0 0 * * * dla uruchamiania raz dziennie
cron.schedule("* * * * *", () => {
    console.log("[cron] initializing cron jobs -> Dynamic merkle tree scaling", new Date().toLocaleString());
    
    BucketScaler();

    console.log("Finished cron job");
});

