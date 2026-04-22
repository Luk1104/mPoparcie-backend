import { type Request, type Response } from "express";
import { insertPetitionService } from "./petition-crud.service.js";
import { getPetitionsService } from "./petition-crud.service.js";
import type { CreatePetitionDTO } from "./petition-crud.schema.js";

export const createPetition = async (
  req: Request<any, any, CreatePetitionDTO>,
  res: Response,
) => {
  try {
    const user = (req as any).user;
    await insertPetitionService(req.body, user.userId);
    return res.status(201).json("OK");
  } catch (error) {
    return res.status(400).json("Wystapil blad");
  }
};

export const getPetition = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const petitions = await getPetitionsService(id as string | undefined);
    return res.status(200).json(petitions);
  } catch (error) {
    return res.status(500).json("Wystapil blad");
  }
};
