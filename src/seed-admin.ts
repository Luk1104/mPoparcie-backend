import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { PetitionUserModel } from "./modules/petition-users/petition-users.model.js";

const MONGO_URI = process.env.MONGO_URI as string;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const seedAdmin = async () => {
	if (!MONGO_URI) {
		console.error("MONGO_URI is not set. Aborting seeding.");
		process.exit(1);
	}

	await mongoose.connect(MONGO_URI);

	const existing = await PetitionUserModel.findOne({ username: ADMIN_USERNAME });

	if (existing) {
		if (existing.role === "admin") {
			console.log(`Admin user '${ADMIN_USERNAME}' already exists.`);
		} else {
			existing.role = "admin";
			if (process.env.ADMIN_PASSWORD) {
				existing.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
			}
			await existing.save();
			console.log(`User '${ADMIN_USERNAME}' updated to role admin.`);
		}
	} else {
		const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
		await PetitionUserModel.create({
			username: ADMIN_USERNAME,
			passwordHash,
			role: "admin",
		});
		console.log(`Admin user '${ADMIN_USERNAME}' created.`);
	}

	await mongoose.connection.close();
	process.exit(0);
};

seedAdmin().catch((err) => {
	console.error("Error seeding admin:", err);
	process.exit(1);
});

// npx tsx src/seed-admin.ts