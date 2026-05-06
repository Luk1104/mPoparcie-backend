import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { PetitionModel } from "./modules/petition-crud/petition-crud.model.js";
import { PETITION_CATEGORIES } from "./modules/petition-crud/petition-crud.schema.js";
import { PetitionUserModel } from "./modules/petition-users/petition-users.model.js";
import { VotingModel } from "./modules/voting/voting.model.js";

const MONGO_URI = process.env.MONGO_URI as string;

const seedPetitions = async () => {
    if (!MONGO_URI) {
        console.error("MONGO_URI is not set. Aborting seeding.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        // Clear existing petitions and votes to avoid duplicate key errors and maintain consistency
        await PetitionModel.deleteMany({});
        await VotingModel.deleteMany({});
        console.log("Cleared existing petitions and votes.");

        // Find a valid user to be the author
        let user = await PetitionUserModel.findOne({ username: process.env.ADMIN_USERNAME || "admin1" });
        if (!user) {
            user = await PetitionUserModel.findOne();
        }

        if (!user) {
            console.error("No user found in the database. Please run seed-admin.ts first.");
            process.exit(1);
        }

        const authorId = user._id.toString();
        console.log(`Using user '${user.username}' (ID: ${authorId}) as author.`);

        const petitionsData = [];
        
        for (let i = 1; i <= 40; i++) {
            const category = PETITION_CATEGORIES[Math.floor(Math.random() * PETITION_CATEGORIES.length)];
            const goal = Math.floor(Math.random() * 5000) + 100;
            const votesCount = Math.floor(Math.random() * goal);
            const views = votesCount + Math.floor(Math.random() * 1000);
            
            // Random deadline between 30 days ago and 365 days in the future
            const daysOffset = Math.floor(Math.random() * 395) - 30;
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + daysOffset);

            const status = deadline < new Date() ? "closed" : "active";

            petitionsData.push({
                title: `Petycja numer ${i}`,
                shortDescription: `Krótki opis petycji o numerze ${i}`,
                longDescription: `To jest szczegółowy opis petycji numer ${i}. Celem tej petycji jest zwrócenie uwagi na istotne kwestie w kategorii ${category}. Prosimy o wsparcie i oddawanie głosów, abyśmy mogli osiągnąć nasz cel ${goal} podpisów.`,
                goal,
                category,
                deadline,
                votes: votesCount, // Still set on model, though service might count from VotingModel
                views,
                author: authorId,
                status
            });
        }

        const createdPetitions = await PetitionModel.insertMany(petitionsData);
        console.log(`Successfully seeded 40 petitions.`);

        // Seed votes into VotingModel to match the votesCount
        console.log("Seeding votes...");
        const allVotes = [];
        for (const petition of createdPetitions) {
            for (let j = 0; j < petition.votes; j++) {
                allVotes.push({
                    petitionId: petition._id,
                    nullifier: `seed-vote-${petition._id}-${j}`
                });
            }
        }
        
        // Insert votes in chunks if there are many
        const chunkSize = 1000;
        for (let i = 0; i < allVotes.length; i += chunkSize) {
            await VotingModel.insertMany(allVotes.slice(i, i + chunkSize));
        }
        console.log(`Successfully seeded ${allVotes.length} votes.`);

    } catch (error) {
        console.error("Error seeding petitions:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedPetitions();

//npx tsx src/seed-petitions.ts 