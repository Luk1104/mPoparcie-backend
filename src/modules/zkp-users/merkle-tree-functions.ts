import { Group } from "@semaphore-protocol/group";
import { ZkpCommitmentModel, ZkpBucketsModel } from "./merkle-tree.model.js";

// import dotenv from "dotenv";
// dotenv.config();

export const addMemberToTree = async (
  commitment: string,
  groupId: string,
) => {
  // try {

    // Sprawdzamy czy taki commitment juz istnnieje
    const existingCommitment = await ZkpCommitmentModel.findOne({ commitment, groupId }).exec();
    if (existingCommitment) {
      console.error("Commitment już istnieje w drzewie");
      throw new Error("Commitment już istnieje w drzewie");
    }

    // 1. Znajdź użytkownika z najwyższym indeksem w danej grupie
    const lastMember = await ZkpCommitmentModel.findOne({ groupId })
      .sort("-index") // Sortowanie malejące po indeksie
      .exec();

    // 2. Ustal nowy indeks (jeśli to pierwszy użytkownik, daj mu 0)
    const nextIndex = lastMember ? lastMember.index + 1 : 0;

    // const group = await buildSemaphoreGroup();
    // const currentRoot = group.root;
    // 3. Zapisz w bazie
    const newZkpCommitment = await ZkpCommitmentModel.create({
      commitment,
      index: nextIndex,
      groupId,
      //currentRoot,
    });

    console.log(`Dodano do drzewa na pozycji: ${nextIndex}`);
    //return newZkpCommitment;
  // } catch (error) {
  //   console.error("Błąd zapisu do drzewa:", error);
  //   throw new Error("Nie udało się dodać użytkownika do Drzewa Merkle'a");
  // }
};

export const buildSemaphoreGroup = async (
  groupId: string,
): Promise<Group> => {
  //Pobierz WSZYSTKICH członków z bazy, POSORTOWANYCH po indeksie rosnąco
  const members = await ZkpCommitmentModel.find({ groupId })
    .sort("index")
    .exec();

  let array: string[] = [];
  // Dodajemy czlonków do grupy (drzewa)
  //Muszą być dodawani dokładnie w takiej kolejności, jak w bazie
  for (const member of members) {
    array.push(member.commitment);
  }

  // Może id groupy trzeba podać i głębokość
  const group = new Group(array);

  // Aktualizuj metadane (aktualny korzeń)
  const metadata = await ZkpBucketsModel.findOneAndUpdate(
    { groupId },
    { currentRoot: group.root },
    { upsert: true, returnDocument: "after" },
  );
  //group to teraz całe drzewo

  //console.log("Aktualny korzeń:", group.root); juz jest wypisany w service

  return group;
};

export const assignGroupIdToCommitment = async (
  commitment: bigint,
  bucketcount: number,
): Promise<number> => {
  try {
    if (!Number.isInteger(bucketcount) || bucketcount <= 0) {
      console.warn("assignGroupIdToCommitment: invalid bucketcount:", bucketcount, "defaulting to 1");
      bucketcount = 1;
    }

    const bucketcountBN = BigInt(bucketcount);
    const result = commitment % bucketcountBN;
    console.log(bucketcountBN, commitment, result);

    const bucketindex = Number(result);

    return bucketindex;
  } catch (error) {
    console.error("Błąd podczas przypisywania groupId:", error);
    throw new Error("Nie udało się przypisać groupId do commitment");
  }
};

export const BucketScaler = async () => {
  try {
    let needsScaling = false;
    let numberofbuckets = await ZkpBucketsModel.countDocuments().exec();
    console.log(`Limit commitmentów w bucketcie: ${process.env.BUCKET_COMMITMENT_LIMIT}`);
    
    for (let i = 0; i < numberofbuckets; i++) {
      const countInBucket = await ZkpCommitmentModel.countDocuments({ groupId: i.toString() }).exec();

      console.log(`Bucket ${i}: ${countInBucket} commitmentów`);

      if (countInBucket > Number(process.env.BUCKET_COMMITMENT_LIMIT)) {

        console.log("Osiągnięto limit w bucketcie", i, "limit: ", process.env.BUCKET_COMMITMENT_LIMIT, "aktualna liczba commitmentów:", countInBucket);
        console.log("Tworzenie nowego bucketu...");
        
        const newBucket = await ZkpBucketsModel.create({
          groupId: (numberofbuckets + 1).toString(),
          currentRoot: "0", // lub inny domyślny root dla pustego drzewa
          lastIndex: -1, //default
        });
        numberofbuckets++;
        needsScaling = true;
        break;
      }
    }
    console.log("Nowa liczba bucketów:", numberofbuckets);
    
    // const members = await ZkpCommitmentModel.find().exec();
    // for (const member of members) {
    //   const newGroupId = await assignGroupIdToCommitment(BigInt(member.commitment), numberofbuckets);
    //   //if (member.groupId !== newGroupId.toString()) {
    //     console.log(`Przenoszenie commitmentu ${member.commitment} z bucketu ${member.groupId} do bucketu ${newGroupId}`);
    //     member.groupId = newGroupId.toString();
    //     member.index = -1; // reset indeksu, zostanie ponownie nadany przy dodawaniu do drzewa
    //     await member.save();
    //   //}
    // }

    if (needsScaling) {
      // 3. TWARDY RESET - Przygotowujemy liczniki indeksów (zaczynają od 0 dla każdego wiadra)
    const nextFreeIndexTracker: Record<string, number> = {};
    for (let i = 0; i < numberofbuckets; i++) {
      nextFreeIndexTracker[i.toString()] = 0;
    }

    // 4. Przeliczamy i re-indeksujemy każdego użytkownika
    const members = await ZkpCommitmentModel.find().exec();
    console.log(`Rozpoczynam przeliczanie ${members.length} commitmentów...`);

    for (const member of members) {
      // Wyliczamy nowe wiadro z modulo
      const newGroupId = await assignGroupIdToCommitment(BigInt(member.commitment), numberofbuckets);
      const newGroupIdStr = newGroupId.toString();

      // Pobieramy z naszego trackera nowy, bezpieczny indeks (0, potem 1, potem 2...)
      const assignedIndex = nextFreeIndexTracker[newGroupIdStr];

      //console.log(`Zapis: ${member.commitment} -> Bucket ${newGroupIdStr}, Index: ${assignedIndex}`);
      
      // Zapisujemy bezpośrednio docelowe wartości (brak błędu E11000)
      member.groupId = newGroupIdStr;
      member.index = Number(assignedIndex);
      await member.save();

      // Podbijamy licznik w tym wiadrze dla następnej osoby (upewnij się, że klucz istnieje)
      nextFreeIndexTracker[newGroupIdStr] = (nextFreeIndexTracker[newGroupIdStr] ?? 0) + 1;
    }

    for (let i = 0; i < numberofbuckets; i++) {
      const group = await buildSemaphoreGroup(i.toString());
      console.log(`Bucket ${i} - nowy root: ${group.root}`);
    }
    }
    else {
      console.log("Nie jest wymagane skalowanie bucketów. Wszystko w normie.");
    }
    

  } catch (error) {
    console.error("Błąd podczas skalowania bucketów:", error);
    throw new Error("Nie udało się skalować bucketów");
  }
};