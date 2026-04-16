import express, { type Router } from "express";
import { login, register } from "./petition-users.controller.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./petition-users.validation.js";

const router: Router = express.Router();

router.post("/login", validateData(loginSchema), login);
router.post("/register", validateData(registerSchema), register);

export default router;
