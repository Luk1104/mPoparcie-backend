import mongoose from "mongoose";

const zkpUserSchema = new mongoose.Schema({
  userHash: { type: String, required: true, unique: true },
});

export const ZkpUserModel = mongoose.model("ZkpUser", zkpUserSchema);

//username: { type: String, required: false, unique: true },