import { ZkpUserModel } from "./zkp-users.model.js";
import { mockRegister } from "./mock-register.js";
import { generateToken } from "../../shared/utils/jwt.util.js";

import { ZkpMetadataModel, ZkpCommitmentModel } from "./merkle-tree.model.js";
import {
  addMemberToTree,
  buildSemaphoreGroup,
} from "./merkle-tree-functions.js";

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
    // zapisanie do drzewa Merkle'a (domyślny groupId = "1")
    await addMemberToTree(commitment);
    // odbuduj grupę i odczytaj aktualny root
    const group = await buildSemaphoreGroup();
    const root = (group && (group as any).root) ?? null;
    console.log("Nowy korzeń:", root);

    // jeśli doszliśmy tu bez błędów — zwróć sukces
    return true;
  } catch (error) {
    console.error("Błąd podczas rejestracji ZKP:", error);
    // rollback: usuń utworzonego użytkownika, jeśli istnieje
    try {
      if (created && created._id) {
        await ZkpUserModel.deleteOne({ _id: created._id }).exec();
      }
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw error;
  }
};

export const zkpTreeDumpService = async (groupId: string = "1") => {
  try {
    const root = await ZkpMetadataModel.find({ groupId }).sort("index").exec();

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
