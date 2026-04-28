import { type Request, type Response } from "express";
import { insertPetitionService } from "./petition-crud.service.js";
import { getSinglePetitionService } from "./petition-crud.service.js";
import { getPetitionsFilteredService } from "./petition-crud.service.js";
import { archivePetitionService } from "./petition-crud.service.js";
import type { ArchivePetitionDTO, CreatePetitionDTO } from "./petition-crud.schema.js";
// import { stat } from "node:fs"; <-- co to jest

export const createPetition = async (
  req: Request<any, any, CreatePetitionDTO>,
  res: Response,
) => {
  try {
    const user = (req as any).user;
    await insertPetitionService(req.body, user.userId);
    return res
      .status(201)
      .json({ status: "success", message: "Petycja utworzona pomyślnie" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res
      .status(400)
      .json({ status: "error", message: message || "Wystąpił błąd" });
  }
};

export const getSinglePetition = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const petition = await getSinglePetitionService(id as string | undefined);
    if (!petition) {
      return res
        .status(404)
        .json({ status: "error", message: "Petycja nie znaleziona" });
    }

    return res.status(200).json({ status: "success", data: petition });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res
      .status(500)
      .json({ status: "error", message: message || "Wystąpił błąd" });
  }
};

export const getPetitionsFiltered = async (req: Request, res: Response) => {
  try {
    const { title, category, page, perPage, sortBy, sortOrder, status} = req.query;

    const pageNum = parseInt(page as string) || 1;
    const perPageNum = parseInt(perPage as string) || 20;

    const result = await getPetitionsFilteredService(
      title as string | undefined,
      category as string | undefined,
      pageNum as number | undefined,
      perPageNum as number | undefined,
      sortBy as string | undefined,
      sortOrder as string | undefined,
      status as string | undefined,
    );

    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res
      .status(500)
      .json({ status: "error", message: message || "Wystąpił błąd" });
  }
};

export const archivePetition = async (
  req: Request<any, any, ArchivePetitionDTO>,
  res: Response,
) => {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", message: "Brak tokenu lub niezalogowany użytkownik" });
    }

    const petitionId = req.body.petitionId;

    await archivePetitionService(petitionId, userId);

    return res
      .status(200)
      .json({ status: "success", message: "Petycja ukryta pomyślnie" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (String(message).includes("Brak uprawnień")) {
      return res
        .status(403)
        .json({ status: "error", message });
    }

    return res
      .status(500)
      .json({ status: "error", message: message || "Wystąpił błąd" });
  }
};
