import express, { type Router } from "express";
import { verifyVote, getPath } from "./voting.controller.js";

const router: Router = express.Router();

router.post("/sign", verifyVote);
router.get("/path/:commitment", getPath);

export default router;
