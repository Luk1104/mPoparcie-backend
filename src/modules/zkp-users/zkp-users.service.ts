import { ZkpUserModel } from "./zkp-users.model.js";
import { mockRegister } from "./mock-register.js";
import { generateToken } from "../../shared/utils/jwt.util.js";

import { ZkpBucketsModel, ZkpCommitmentModel } from "./merkle-tree.model.js";
import {
  addMemberToTree,
  buildSemaphoreGroup,
  assignGroupIdToCommitment,
} from "./merkle-tree-functions.js";
import { number } from "zod";

export const zkprequestuserHashService = async () => {
  // zamokowana i niekompletna funkcja - czekamy na identta
  const userHash = await mockRegister();
  //prawodopodobnie będzie tu odwołanie do funkcji komunikuajcych sie z identt
  //
  const token = generateToken({
    username: "none",
    userId: userHash,
    role: "zkp-user",
  });

  return token;
};

export const zkpregisterService = async (
  userHash: string,
  commitment: string,
) => {
  // zapisanie userhash w bazie danych
  const existing = await ZkpUserModel.findOne({ userHash });
  if (existing) throw new Error("Taka osoba już jest zarejestrowana");

  const created = await ZkpUserModel.create({ userHash });
  if (!created) throw new Error("Nie udało się zarejestrować użytkownika");

  try {

    let numberofbuckets = await ZkpBucketsModel.countDocuments().exec();
    
    if (numberofbuckets === 0) numberofbuckets = 1; // zabezpieczenie przed dzieleniem przez zero, powinien być zawsze przynajmniej 1 bucket
    //wyliczenie do jakiego bucketu przydzielić commitment
    const groupId = await assignGroupIdToCommitment(BigInt(commitment), numberofbuckets);
    
    // zapisanie do drzewa Merkle'a
    await addMemberToTree(commitment, groupId.toString());
    // odbuduj grupę i odczytaj aktualny root
    const group = await buildSemaphoreGroup(groupId.toString());
    const root = (group && (group as any).root) ?? null;
    console.log("Nowy korzeń:", root);

    // jeśli doszliśmy tu bez błędów — zwróć sukces
    return true;
    
  } catch (error) {
    console.error("Błąd podczas rejestracji ZKP:", error);
    // rollback: usuń utworzonego użytkownika(userhash), jeśli istnieje
    try {
      if (created && created._id) {
        await ZkpUserModel.deleteOne({ _id: created._id }).exec();
        console.log("Rollback: usunięto utworzonego użytkownika");
      }
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw error;
  }
};

export const zkpTreeDumpService = async (groupId: string) => {
  try {
    const root = await ZkpBucketsModel.find({ groupId }).sort("index").exec();

    // Pobierz surowe wpisy z bazy tej samej grupy (posortowane po indeksie)
    const members = await ZkpCommitmentModel.find({ groupId })
      .sort("index")
      .exec();

    return { root, members };
  } catch (error) {
    console.error("Błąd podczas dumpowania drzewa:", error);
    throw new Error("Nie udało się pobrać danych drzewa");
  }
};
