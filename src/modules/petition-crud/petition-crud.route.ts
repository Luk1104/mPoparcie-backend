import express, { type Router } from "express";
import { createPetition } from "./petition-crud.controller.js";
import { getPetition } from "./petition-crud.controller.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";
import { CreatePetitionSchema } from "./petition-crud.schema.js";
import { verifyToken } from "../../shared/middleware/jwt.middleware.js";

const router: Router = express.Router();

router.post(
  "/create",
  verifyToken,
  validateData(CreatePetitionSchema),
  createPetition,
);

router.get("/", getPetition);
router.get("/:id", getPetition);
// router.get("/me", getPetition);

export default router;
