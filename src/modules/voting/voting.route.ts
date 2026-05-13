import express, { type Router } from "express";
import { verifyVote, getGroup } from "./voting.controller.js";

const router: Router = express.Router();

router.post("/sign", verifyVote);
router.get("/group/:groupId", getGroup);

export default router;
