import express, { type Router } from "express";
import { zkprequestuserHash, zkpregister } from "./zkp-users.controller.js";
import { zkpregisterSchema } from "./zkp-users.schema.js";
import { zkpTreeDump } from "./zkp-users.controller.js";

import { verifyToken } from "../../shared/middleware/jwt.middleware.js";
import { validateData } from "../../shared/middleware/validation.middleware.js";

const router: Router = express.Router();

router.get("/register/1", zkprequestuserHash);
router.post("/register/2", verifyToken, validateData(zkpregisterSchema), zkpregister);
router.get("/tree-dump/:groupId", zkpTreeDump);

export default router;
