import { PetitionModel } from "./petition-crud.model.js";
import { type CreatePetitionDTO } from "./petition-crud.schema.js";
import { PetitionUserModel } from "../petition-users/petition-users.model.js";

export const insertPetitionService = async (
    petitionData: CreatePetitionDTO,
    userId: string,
    role: string,
) => {

    if (role !== "user") {
        throw new Error("Brak uprawnień: tylko użytkownicy mogą tworzyć petycje");
    }
    
    const { deadline, ...restData } = petitionData;

    try {
        const userExists = await PetitionUserModel.findById(userId);
        if (!userExists) {
            throw new Error("Nie znaleziono użytkownika");
        }
    } catch (error) {
        throw new Error(
            "Nie znaleziono użytkownika: " + String(error),
        );
    }

    const petition = new PetitionModel({
        ...restData,
        deadline: new Date(deadline),
        author: userId,
    });

    try {
        await petition.validate();
        await petition.save();
        return;
    } catch (error) {
        throw new Error("Błąd podczas zapisywania petycji: " + String(error));
    }
};

export const archivePetitionService = async (
    petitionId: string,
    userId: string,
    role: string,
) => {
    try {
        const petition = await PetitionModel.findById(petitionId);
        if (!petition) {
            throw new Error("Petycja nie znaleziona");
        }

        if (petition.author !== userId && role !== "admin") {
            throw new Error(
                "Brak uprawnień: tylko autor lub admin może zmienić status petycji",
            );
        }
        if (petition.status === "archived")
            if (new Date() > petition.deadline) petition.status = "closed";
            else petition.status = "active";
        else petition.status = "archived";
        await petition.save();
    } catch (error) {
        throw new Error(
            "Nie udało się zmienić statusu petycji: " + String(error),
        );
    }
};
