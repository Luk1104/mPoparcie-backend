import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import petitionUsersRoute from "./modules/petition-users/petition-users.route.js";
import petitionCrudRoute from "./modules/petition-crud/petition-crud.route.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //|| "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use("/api/petition/user", petitionUsersRoute);
app.use("/api/petition", petitionCrudRoute);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Error while connecting to MongoDB:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(
    `[${new Date().toLocaleTimeString()}] Server started on port ${PORT}`,
  );
});
