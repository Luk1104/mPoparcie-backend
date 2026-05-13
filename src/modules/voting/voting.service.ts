import { verifyProof } from "@semaphore-protocol/proof";
import { type SemaphoreProofDTO } from "./voting.schema.js";
import { ZkpMetadataModel } from "../zkp-users/merkle-tree.model.js";
import { type zkpTreeDumpService } from "../zkp-users/zkp-users.service.js";
import { PetitionModel } from "../petition-crud/petition-crud.model.js";
import { VotingModel } from "./voting.model.js";
import { encodeBytes32String, toBigInt } from "ethers";

const signPetition = async (petitionId: string, nullifier: string) => {
  const petition = await PetitionModel.findById(petitionId).exec();
  const votes = await VotingModel.create({ petitionId, nullifier });

  petition!.votes += 1;
  await petition!.save();
  await votes.save();
  return;
};

export const verifyVoteService = async (
  proof: SemaphoreProofDTO,
  originalPetitionId: string,
) => {
  const nullifier = proof.nullifier;
  const provedScope = proof.scope;
  const message = proof.message;
  const root = proof.merkleTreeRoot;

  const expectedScope = toBigInt(
    encodeBytes32String(originalPetitionId),
  ).toString();

  if (provedScope !== expectedScope) {
    throw new Error("Dowód dotyczy innej petycji (niezgodny zakres/scope)");
  }

  const metadata = await ZkpMetadataModel.findOne({ groupId: "1" }).exec();
  if (!metadata) {
    throw new Error("Nie znaleziono korzenia drzewa");
  }
  const currentRoot = metadata.currentRoot;

  if (root !== currentRoot) {
    throw new Error("Nieaktualny korzeń drzewa");
  }

  if (message !== "1") {
    throw new Error("Nieprawidłowa wiadomość");
  }

  const petitionexists = await PetitionModel.exists({
    _id: originalPetitionId,
  });
  if (!petitionexists) {
    throw new Error("Petycja nie istnieje");
  }

  const nullifierExists = await VotingModel.exists({ nullifier });
  if (nullifierExists) {
    throw new Error("Ten użytkownik już zagłosował");
  }

  const isValid = await verifyProof(proof);
  if (!isValid) {
    throw new Error("Invalid proof");
  }

  signPetition(originalPetitionId, nullifier);
  return true;
};

export const getCommitmentsArrayService = async (
  group: Awaited<ReturnType<typeof zkpTreeDumpService>>,
) => {
  const membersArray = Array.isArray(group.members) ? group.members : [];
  const sortedMembers = [...membersArray].sort((a, b) => a.index - b.index);
  const commitments = sortedMembers.map((memberObj) => {
    return memberObj.commitment
      ? memberObj.commitment.toString()
      : memberObj.toString();
  });
  return commitments;
};
