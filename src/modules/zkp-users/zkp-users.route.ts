import express, { type Router } from "express";
import { zkprequestuserHash, zkpregister } from "./zkp-users.controller.js";
import { zkpregisterSchema } from "./zkp-users.schema.js";
import { zkpTreeDump } from "./zkp-users.controller.js";

import { verifyToken } from "../../shared/middleware/jwt.middleware.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";

import { webhookReceiver } from "./zkp-users.controller.js";
import { generateLink } from "./zkp-users.controller.js";

const router: Router = express.Router();

router.get("/register/1", generateLink);
router.get("/register/2/:document_id", zkprequestuserHash);
router.post(
  "/register/3",
  verifyToken,
  validateData(zkpregisterSchema),
  zkpregister,
);
router.post("/identt2check/webhook", webhookReceiver);
router.get("/tree-dump", zkpTreeDump);

export default router;
