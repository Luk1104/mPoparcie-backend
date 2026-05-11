import { type Request, type Response, type NextFunction } from "express";
import { insertPetitionService } from "./petition-update.service.js";
import { getSinglePetitionService } from "./petition-read.service.js";
import { getPetitionsFilteredService } from "./petition-read.service.js";
import { archivePetitionService } from "./petition-update.service.js";
import { getPetitionsByUserService } from "./petition-read.service.js";
import type { CreatePetitionDTO } from "./petition-crud.schema.js";

export const createPetition = async (
    req: Request<any, any, CreatePetitionDTO>,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = (req as any).user;
        await insertPetitionService(req.body, user.userId, user.role);
        return res.status(201).json({
            status: "success",
            message: "Petycja utworzona pomyślnie",
        });
    } catch (error) {
        next(error);
    }
};

export const getSinglePetition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;

        const petition = await getSinglePetitionService(id as string);
        if (!petition) {
            return res
                .status(404)
                .json({ status: "error", message: "Petycja nie znaleziona" });
        }

        return res.status(200).json({ status: "success", data: petition });
    } catch (error) {
        next(error);
    }
};

export const getPetitionsFiltered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, page, perPage, sortBy, sortOrder, status } =
            req.query;

        const role = String((req as any).user?.role ?? "none");
        console.log("User role in getPetitionsFiltered:", role);

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
            role as string | undefined,
        );

        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

export const archivePetition = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user ?? {};
        const userId = String(user.userId);
        const userRole = String(user.role);
        const petitionId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Brak tokenu lub niezalogowany użytkownik",
            });
        }

        await archivePetitionService(petitionId as string, userId, userRole);

        return res
            .status(200)
            .json({ status: "success", message: "Petycja ukryta pomyślnie" });
    } catch (error) {
        // const message = error instanceof Error ? error.message : String(error);
        // if (String(message).includes("Brak uprawnień")) {
        //     return res.status(403).json({ status: "error", message });
        next(error);
        }
};

export const getPetitionsByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const userId = user.userId;
        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Brak tokenu lub niezalogowany użytkownik",
            });
        }
        const data = await getPetitionsByUserService(userId);
        return res.status(200).json({
            status: "success",
            message: "Petycje użytkownika pobrane pomyślnie",
            data,
        });
    } catch (error) {
        next(error);
    }
};
