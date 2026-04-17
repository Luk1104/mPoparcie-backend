import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Nazwa użytkownika musi mieć minimum 3 znaki")
      .max(16, "Nazwa użytkownika może mieć maksymalnie 16 znaków"),
    password: z
      .string()
      .min(12, "Hasło musi mieć minimum 12 znaków")
      .max(100, "Hasło może mieć maksymalnie 100 znaków"),
    name: z
      .string()
      .min(2, "Imię musi mieć minimum 2 znaki")
      .max(20, "Imię może mieć maksymalnie 20 znaków"),
    surname: z
      .string()
      .min(2, "Nazwisko musi mieć minimum 2 znaki")
      .max(40, "Nazwisko może mieć maksymalnie 40 znaków"),
  })
  .strict();

export const loginSchema = z.object({
  username: z.string().min(3, "Nazwa użytkownika musi mieć minimum 3 znaki"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
