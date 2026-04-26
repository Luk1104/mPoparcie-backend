import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import petitionUsersRoute from "./modules/petition-users/petition-users.route.js";
import petitionCrudRoute from "./modules/petition-crud/petition-crud.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // ZMIEŃ NA PORT SWOJEGO FRONTENDU (bez ukośnika na końcu!)
    credentials: true, // Pozwala na przesyłanie ciasteczek
  }),
);

app.use(express.json());

app.use("/api/petition/user", petitionUsersRoute);
app.use("/api/petition", petitionCrudRoute);

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
