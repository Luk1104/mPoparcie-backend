import { PetitionModel } from "./petition-crud.model.js";
import { type CreatePetitionDTO } from "./petition-crud.schema.js";
import { PetitionUserModel } from "../petition-users/petition-users.model.js";

export const insertPetitionService = async (
  petitionData: CreatePetitionDTO,
  userId: string,
) => {
  const { deadline, ...restData } = petitionData;

  try {
    const userExists = await PetitionUserModel.findById(userId);
    if (!userExists) {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error("User from token not found in database: " + String(error));
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
    throw new Error("Error while saving petition: " + String(error));
  }
};

export const getPetitionsService = async () => {
  try {
    //todo: frontend should send what petitions it wants. Now return all petition sorted by date

    const petitions = await PetitionModel.find()
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const petitionsWithDisplayName = await Promise.all(
      petitions.map(async (petition) => {
        const user = await PetitionUserModel.findById(petition.author);
        const displayName = user
          ? `${user.name} ${user.surname}`
          : "Nieznany Autor";

        return {
          ...petition,
          authorDisplayName: displayName,
        };
      }),
    );

    return petitionsWithDisplayName;
  } catch (error) {
    throw new Error("Failed to fetch petitions: " + String(error));
  }
};
