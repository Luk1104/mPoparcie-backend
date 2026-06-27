import axios from "axios";
import { ZkpUserModel } from "./zkp-users.model.js";
import { generateToken } from "../../shared/utils/jwt.util.js";

import { ZkpMetadataModel, ZkpCommitmentModel } from "./merkle-tree.model.js";
import {
  addMemberToTree,
  buildSemaphoreGroup,
} from "./merkle-tree-functions.js";
import { VotingModel } from "../voting/voting.model.js";

import {
  type IdenttTokenResponseDTO,
  type IdenttLinkResponseDTO,
} from "./zkp-users.schema.js";
import EventEmitter from "events";

export const generateLinkService = async () => {
  const token = await getIdenttToken();
  const reponse = await axios.post<IdenttLinkResponseDTO>(
    "https://i2c.ivs-stg02.identt.pl/api/v2/verify/self/init/",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  //generate a link https://sv-lite.ivs-stg02.identt.pl/self-verify/?document_id=<document_id>&session_id=<session_id>
  const { session_id, document_id } = reponse.data;
  const link = `https://sv-lite.ivs-stg02.identt.pl/self-verify/?document_id=${document_id}&session_id=${session_id}`;
  return link;
};

let cachedToken: string | null = null;
let tokenExpiration: number = 0;
const getIdenttToken = async () => {
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    return cachedToken;
  }
  const formData = new URLSearchParams();
  formData.append("client_id", process.env.IDENTT_CLIENT_ID as string);
  formData.append("client_secret", process.env.IDENTT_CLIENT_SECRET as string);
  formData.append("username", process.env.IDENTT_USERNAME as string);
  formData.append("password", process.env.IDENTT_PASSWORD as string);
  formData.append("grant_type", "password");
  const response = await axios.post<IdenttTokenResponseDTO>(
    "https://i2c.ivs-stg02.identt.pl/auth/token/",
    formData,
    {
      headers: {
        Authorization: `Basic ${process.env.IDENTT_BASIC_AUTH_TOKEN as string}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const access_token = response.data.access_token;
  const expires_in = response.data.expires_in;

  cachedToken = access_token;
  tokenExpiration = Date.now() + expires_in * 1000 - 60000; // -1 minute
  return access_token;
};

export const webhookEmitter = new EventEmitter();

export const zkprequestuserHashService = async (document_id: string) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => {
        reject(new Error("Timeout oczekiwania na webhook z Identt"));
      },
      5 * 60 * 1000,
    ); //5 minutes

    webhookEmitter.once(document_id, (data: { userHash: string }) => {
      const { userHash } = data;

      const token = generateToken({
        username: "none",
        userId: userHash,
        role: "zkp-user",
      });
      clearTimeout(timeout);
      resolve(token);
    });
  });
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

export const zkpNullifierDumpService = async () => {
  try {
    const votes = await VotingModel.find({}).sort("petitionId").exec();

    // Group nullifiers by petitionId
    const grouped: Record<string, string[]> = {};
    for (const vote of votes) {
      const petitionId = vote.petitionId.toString();
      if (!grouped[petitionId]) {
        grouped[petitionId] = [];
      }
      grouped[petitionId].push(vote.nullifier);
    }

    const petitions = Object.entries(grouped).map(
      ([petitionId, nullifiers]) => ({
        petitionId,
        nullifiers,
      }),
    );

    return {
      totalPetitions: petitions.length,
      petitions,
    };
  } catch (error) {
    console.error("Błąd podczas dumpowania nullifierów:", error);
    throw new Error("Nie udało się pobrać danych nullifierów");
  }
};
