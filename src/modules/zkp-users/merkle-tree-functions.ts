import { Group } from "@semaphore-protocol/group";
import { ZkpCommitmentModel, ZkpMetadataModel} from "./merkle-tree.model.js";

export const addMemberToTree = async (
    commitment: string,
     groupId: string = "1") => {
  try {
    // 1. Znajdź użytkownika z najwyższym indeksem w danej grupie
    const lastMember = await ZkpCommitmentModel.findOne({ groupId })
      .sort("-index") // Sortowanie malejące po indeksie
      .exec();

    // 2. Ustal nowy indeks (jeśli to pierwszy użytkownik, daj mu 0)
    const nextIndex = lastMember ? lastMember.index + 1 : 0;

    // 3. Zapisz w bazie
    const newZkpCommitment = await ZkpCommitmentModel.create({
      commitment,
      index: nextIndex,
      groupId
    });

    console.log(`Dodano do drzewa na pozycji: ${nextIndex}`);
    //return newZkpCommitment;

  } catch (error) {
    console.error("Błąd zapisu do drzewa:", error);
    throw new Error("Nie udało się dodać użytkownika do Drzewa Merkle'a");
  }
};

export const buildSemaphoreGroup = async (groupId: string = "1"): Promise<Group> => {
  //Pobierz WSZYSTKICH członków z bazy, POSORTOWANYCH po indeksie rosnąco
  const members = await ZkpCommitmentModel.find({ groupId }).sort("index").exec();

  // Może id groupy trzeba podać i głębokość
  const group = new Group();

  // Dodajemy czlonków do grupy (drzewa)
  //Muszą być dodawani dokładnie w takiej kolejności, jak w bazie
  for (const member of members) {
    group.addMember(member.commitment);
  }

  // Aktualizuj metadane (aktualny korzeń)
    const metadata = await ZkpMetadataModel.findOneAndUpdate(
      { groupId },
      { currentRoot: group.root },
      { upsert: true, new: true }
    );
  //group to teraz całe drzewo

  //console.log("Aktualny korzeń:", group.root); juz jest wypisany w service

  return group;
};