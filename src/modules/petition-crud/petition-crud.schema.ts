import { z } from "zod";

export const PETITION_CATEGORIES = [
    "Edukacja",
    "Zdrowie",
    "Środowisko",
    "Transport",
    "Infrastruktura",
    "Bezpieczeństwo",
    "Prawa człowieka",
    "Prawa zwierząt",
    "Rynek pracy",
    "Podatki",
    "Mieszkalnictwo",
    "Kultura",
    "Sport",
    "Polityka społeczna",
    "Cyfryzacja",
    "Prawo i sądownictwo",
    "Samorząd lokalny",
    "Gospodarka",
    "Nauka",
    "Energetyka",
    "Inne",
] as const;

export const CreatePetitionSchema = z
    .object({
        title: z.string().min(1, "Tytul jest wymagany"),
        shortDescription: z
            .string()
            .min(1, "Krotki opis jest wymagany")
            .max(100, "Krotki opis nie moze byc dluzszy niz 100 znakow"),
        longDescription: z
            .string()
            .min(1, "Opis jest wymagany")
            .max(1000, "Opis nie moze byc dluzszy niz 1000 znakow"),
        goal: z.number().min(1, "Cel musi byc wiekszy niz 0"),
        category: z.enum(PETITION_CATEGORIES),
        deadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Nieprawidlowy format daty",
        }),
        status: z.enum(["active", "closed", "archived"]).default("active"),
    })
    .strict();

export type CreatePetitionDTO = z.infer<typeof CreatePetitionSchema>;
export type PetitionCategory = (typeof PETITION_CATEGORIES)[number];
