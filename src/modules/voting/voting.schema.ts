import { z } from "zod";

export const SemaphoreProofSchema = z
  .object({
    merkleTreeDepth: z.number(),
    merkleTreeRoot: z.string(), // NumericString
    message: z.string(), // NumericString
    nullifier: z.string(), // NumericString
    scope: z.string(), // NumericString
    points: z.tuple([
      z.string(),
      z.string(),
      z.string(),
      z.string(),
      z.string(),
      z.string(),
      z.string(),
      z.string(),
    ]), // PackedGroth16Proof
  })
  .strict();

export type SemaphoreProofDTO = z.infer<typeof SemaphoreProofSchema>;
