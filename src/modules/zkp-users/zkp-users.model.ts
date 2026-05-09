import mongoose from "mongoose";

const zkpUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  userHash: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
});

export const ZkpUserModel = mongoose.model("ZkpUser", zkpUserSchema);
