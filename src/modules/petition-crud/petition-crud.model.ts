import mongoose from "mongoose";
import { PETITION_CATEGORIES } from "./petition-crud.schema.js";
import cron from "node-cron";

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
        status: {
            type: String,
            enum: ["active", "closed", "archived"],
            default: "active",
        },
        views: { type: Number, default: 0 },
    },
    { timestamps: true },
);

export const PetitionModel = mongoose.model("Petition", PetitionSchema);

//Zmiana stausu petycji active -> close po upłynieciu deadline

console.log("[cron] initializing cron jobs");

// Run every day at midnight (server local time)
cron.schedule("0 0 * * *", () => {
    console.log("Staring cron job");
    PetitionModel.updateMany(
        { deadline: { $lte: new Date() }, status: "active" },
        { $set: { status: "closed" } }
    )
    .then(result => {
        console.log(`[cron] Updated ${result.modifiedCount} petitions to closed status`);
    })
    .catch(error => {
        console.error("[cron] Error updating petition statuses:", error);
    });
});
