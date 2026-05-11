import { z } from "zod";

export const zkpregisterSchema = z
  .object({
    commitment: z.string()
      .min(1, "Commitment jest wymagany")
      .max(300, "Commitment nie może być dłuższy niż 300 znaków")
      .regex(/^\d+$/, "Commitment musi być ciągiem cyfr"),
  })
  .strict();

export type RegisterDTO = z.infer<typeof zkpregisterSchema>;

// username: z
//       .string()
//       .min(2, "Nazwa użytkownika musi mieć minimum 2 znaki")
//       .max(16, "Nazwa użytkownika może mieć maksymalnie 16 znaków"),
