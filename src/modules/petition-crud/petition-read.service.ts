import { PetitionModel } from "./petition-crud.model.js";
import { type CreatePetitionDTO } from "./petition-crud.schema.js";
import { PetitionUserModel } from "../petition-users/petition-users.model.js";
import { VotingModel } from "../voting/voting.model.js";

export const getSinglePetitionService = async (id?: string) => {
    try {
        // When id is provided return a single petition; do not return all
        if (!id) {
            throw new Error("Brak id petycji");
        }

        const petition = await PetitionModel.findById(id).select("-__v").lean();

        if (!petition) {
            return null;
        }

        const user = await PetitionUserModel.findById(petition.author);
        const displayName = user
            ? `${user.name} ${user.surname}`
            : "Nieznany Autor";

        const votesCount = await VotingModel.countDocuments({
            petitionId: petition._id,
        });

        return {
            ...petition,
            authorDisplayName: displayName,
            votes: votesCount,
        };
    } catch (error) {
        throw new Error("Failed to fetch petition: " + String(error));
    }
};

export const getPetitionsFilteredService = async (
    title?: string,
    category?: string,
    page: number = 1,
    perPageNum: number = 20,
    sortBy?: string,
    sortOrder?: string,
    status: string = "active",
) => {
    try {
        const query: any = {};
        if (title) query.title = { $regex: title, $options: "i" };
        if (category) query.category = category;
        if (status !== "archived") query.status = status;
        else query.status = "active";

        const pageNum = Math.max(1, Math.floor(Number(page) || 1));

        const totalItems = await PetitionModel.countDocuments(query);
        const totalPages =
            totalItems === 0 ? 0 : Math.ceil(totalItems / perPageNum);

        const direction = sortOrder === "desc" ? -1 : 1; // asc by default

        let sortObj: any = { createdAt: direction };
        if (sortBy === "a")
            sortObj = { title: direction }; // Sort by title
        else if (sortBy === "d")
            sortObj = { deadline: direction }; // Sort by deadline
        else if (sortBy === "v") sortObj = { votes: direction }; // Sort by votes

        const petitions = await PetitionModel.find(query)
            .sort(sortObj)
            .skip((pageNum - 1) * perPageNum)
            .limit(perPageNum)
            .select("-__v")
            .lean();

        const petitionsWithDisplayName = await Promise.all(
            petitions.map(async (petition) => {
                const petition_author = await PetitionUserModel.findById(
                    petition.author,
                );
                const displayAuthor = petition_author
                    ? `${petition_author.name} ${petition_author.surname}`
                    : "Nieznany Autor";

                const votesCount = await VotingModel.countDocuments({
                    petitionId: petition._id,
                });

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
