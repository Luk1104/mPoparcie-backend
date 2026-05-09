import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, "Nazwa użytkownika musi mieć minimum 2 znaki")
      .max(16, "Nazwa użytkownika może mieć maksymalnie 16 znaków"),
    password: z
      .string()
      .min(12, "Hasło może mieć minimum 12 znaków")
      .max(100, "Hasło może mieć maksymalnie 100 znaków"),
  })
  .strict();

export type RegisterDTO = z.infer<typeof registerSchema>;
