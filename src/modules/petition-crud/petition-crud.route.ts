import express, { type Router } from "express";
import { createPetition } from "./petition-crud.controller.js";
import { getPetition } from "./petition-crud.controller.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";
import { CreatePetitionSchema } from "./petition-crud.zod.js";

const router: Router = express.Router();

router.post("/create", validateData(CreatePetitionSchema), createPetition);
router.get("/get", getPetition);

export default router;
