import { Request, Response } from "express";
import { CreatePetitionSchema } from "./petition-crud.zod.js";
import { insertPetitionService } from "./petition-crud.service.js";
import { getPetitionsService } from "./petition-crud.service.js";
import { z } from "zod";

export const createPetition = (
  req: Request<{}, any, z.infer<typeof CreatePetitionSchema>>,
  res: Response,
) => insertPetitionService(req.body);

export const getPetition = (req: Request, res: Response) =>
  getPetitionsService();
