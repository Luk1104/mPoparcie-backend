import { type Request, type Response } from "express";
import { CreatePetitionSchema } from "./petition-crud.zod.js";
import { insertPetitionService } from "./petition-crud.service.js";
import { getPetitionsService } from "./petition-crud.service.js";
import { z } from "zod";

export const createPetition = async (
  req: Request<{}, any, z.infer<typeof CreatePetitionSchema>>,
  res: Response,
) => {
  try {
    await insertPetitionService(req.body);
    return res.status(201).json("OK");
  } catch (error) {
    return res.status(400).json("Wystapil blad");
  }
};

export const getPetition = async (req: Request, res: Response) => {
  try {
    const petitions = await getPetitionsService();
    return res.status(200).json(petitions);
  } catch (error) {
    return res.status(500).json("Wystapil blad");
  }
};
