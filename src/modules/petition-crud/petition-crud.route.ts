import express, { type Router } from "express";
import { createPetition } from "./petition-crud.controller.js";
import { getPetition } from "./petition-crud.controller.js";

const router: Router = express.Router();

router.post("/create", createPetition);
router.get("/get", getPetition);

export default router;
