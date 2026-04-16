import { z } from "zod";
import { CreatePetitionSchema } from "./petition-crud.zod.js";
import { PetitionModel } from "./petition-crud.mongo.js";

export const insertPetitionService = async (
  petitionData: z.infer<typeof CreatePetitionSchema>,
) => {
  const { token, deadline, ...restData } = petitionData;

  //todo: check name in the token, check if exists in database, if not return error, if yes, add to petition data
  // for now author is going to be "test"

  const petition = new PetitionModel({
    ...restData,
    deadline: new Date(deadline),
    author: "test",
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
      .select("-_id -__v");

    return petitions;
  } catch (error) {
    throw new Error("Failed to fetch petitions: " + String(error));
  }
};
