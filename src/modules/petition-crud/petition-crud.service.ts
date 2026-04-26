import { PetitionModel } from "./petition-crud.model.js";
import { type CreatePetitionDTO } from "./petition-crud.schema.js";
import { PetitionUserModel } from "../petition-users/petition-users.model.js";
import { VotingModel } from "../voting/voting.model.js";

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

export const getSinglePetitionService = async (
  id?: string,
) => {
  try {
    // When id is provided return a single petition; do not return all
    if (!id) {
      throw new Error("Brak id petycji");
    }

    const petition = await PetitionModel.findById(id)
      .select("-__v")
      .lean();

    if (!petition) {
      return null;
    }

    const user = await PetitionUserModel.findById(petition.author);
    const displayName = user ? `${user.name} ${user.surname}` : "Nieznany Autor";

    const votesCount = await VotingModel.countDocuments({ petitionId: petition._id });

    return {
      ...petition,
      authorDisplayName: displayName,
      votes: votesCount,
    };
  } catch (error) {
    throw new Error("Failed to fetch petition: " + String(error));
  }
};

//const query = id ? { _id: id , _name: name , _category: category} : {};

export const getPetitionsFilteredService = async (
  title?: string,
  category?: string,
  page = 1 ,
  perPage = 20,
) => {
  try {
    const query: any = {};
    if (title) query.title = { $regex: title, $options: "i" };
    if (category) query.category = category;

    const pageNum = Math.max(1, Math.floor(Number(page) || 1));
    const perPageNum = Math.max(1, Math.floor(Number(perPage) || 20));

    const totalItems = await PetitionModel.countDocuments(query);
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPageNum);

    const petitions = await PetitionModel.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * perPageNum)
      .limit(perPageNum)
      .select("-__v")
      .lean();

    const petitionsWithDisplayName = await Promise.all(
      petitions.map(async (petition) => {
        const petition_author = await PetitionUserModel.findById(petition.author);
        const displayAuthor = petition_author
          ? `${petition_author.name} ${petition_author.surname}`
          : "Nieznany Autor";

        const votesCount = await VotingModel.countDocuments({ petitionId: petition._id });

        return {
          ...petition,
          authorDisplayName: displayAuthor,
          votes: votesCount,
        };
      }),
    );

    return {
      petitions: petitionsWithDisplayName,
      meta: {
        totalItems,
        totalPages,
        page: pageNum,
        perPage: perPageNum,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch petitions: " + String(error));
  }
};