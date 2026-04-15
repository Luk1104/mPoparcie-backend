import { z } from "zod";

export const CreatePetitionSchema = z.object({
  title: z.string().min(1, "Tytul jest wymagany"),
  shortDescription: z.string().min(1, "Krotki opis jest wymagany"),
  longDescription: z.string().min(1, "Opis jest wymagany"),
  goal: z.number().min(1, "Cel musi byc wiekszy niz 0"),
  category: z.string().min(1, "Kategoria jest wymagana"),
  deadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Nieprawidlowy format daty",
  }),
  token: z.string().min(1, "Token jest wymagany"),
});
