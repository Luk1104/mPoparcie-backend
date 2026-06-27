import { z } from "zod";

export const zkpregisterSchema = z
  .object({
    commitment: z
      .string()
      .min(1, "Commitment jest wymagany")
      .max(300, "Commitment nie może być dłuższy niż 300 znaków")
      .regex(/^\d+$/, "Commitment musi być ciągiem cyfr"),
  })
  .strict();

export const getIdenttTokenResponseSchema = z
  .object({
    access_token: z.string(),
    expires_in: z.number(),
    token_type: z.string(),
    scope: z.string(),
    refresh_token: z.string(),
  })
  .strict();

export const getIdenttLinkResponseSchema = z
  .object({
    session_id: z.string(),
    document_id: z.string(),
    client_tid: z.string().nullable().optional(),
    lang: z.string(),
    bc_name: z.string(),
    state: z.string(),
  })
  .strict();

export type IdenttLinkResponseDTO = z.infer<typeof getIdenttLinkResponseSchema>;

export type IdenttTokenResponseDTO = z.infer<
  typeof getIdenttTokenResponseSchema
>;

export type RegisterDTO = z.infer<typeof zkpregisterSchema>;
