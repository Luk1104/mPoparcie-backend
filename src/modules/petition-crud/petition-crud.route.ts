import express, { type Router } from "express";
import { createPetition } from "./petition-crud.controller.js";
import { getSinglePetition } from "./petition-crud.controller.js";
import { getPetitionsFiltered } from "./petition-crud.controller.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";
import { CreatePetitionSchema } from "./petition-crud.schema.js";
import { archivePetition } from "./petition-crud.controller.js";
import { verifyToken } from "../../shared/middleware/jwt.middleware.js";

const router: Router = express.Router();

router.post(
    "/create",
    verifyToken,
    validateData(CreatePetitionSchema),
    createPetition,
);

router.get("/", getPetitionsFiltered);
router.get("/:id", getSinglePetition);
router.patch("/:id/archive", verifyToken, archivePetition);
// router.get("/me", getPetition);

export default router;
