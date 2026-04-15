import express, { type Router } from "express";
import { login, register } from "./petition-users.controller.js";

const router: Router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;
