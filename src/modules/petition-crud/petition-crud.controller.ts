import { type Request, type Response } from "express";
import { insertPetitionService } from "./petition-crud.service.js";
import { getSinglePetitionService } from "./petition-crud.service.js";
import { getPetitionsFilteredService } from "./petition-crud.service.js";
import type { CreatePetitionDTO } from "./petition-crud.schema.js";

export const createPetition = async (
  req: Request<any, any, CreatePetitionDTO>,
  res: Response,
) => {
  try {
    const user = (req as any).user;
    await insertPetitionService(req.body, user.userId);
    return res.status(201).json({ status: "success", message: "Petycja utworzona pomyślnie" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(400).json({ status: "error", message: message || "Wystąpił błąd" });
  }
};

export const getSinglePetition = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const petition = await getSinglePetitionService(id as string | undefined);
    if (!petition) {
      return res.status(404).json({ status: "error", message: "Petycja nie znaleziona" });
    }

    return res.status(200).json({ status: "success", data: petition });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ status: "error", message: message || "Wystąpił błąd" });
  }
};

export const getPetitionsFiltered = async (req: Request, res: Response) => {
  try {
    const { title, category } = req.query;

    const petitions = await getPetitionsFilteredService(
      title as string | undefined,
      category as string | undefined,
    );
    return res.status(200).json({ status: "success", data: petitions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ status: "error", message: message || "Wystąpił błąd" });
  }
};
