import { z } from "zod";

export const NonceBody = z
  .object({
    pubkey: z.string().min(32).max(44),
  })
  .strict();

export const VerifyBody = z
  .object({
    message: z.string().min(1).max(2000),
    signature: z.string().min(1).max(128),
    pubkey: z.string().min(32).max(44),
  })
  .strict();

export type NonceBodyT = z.infer<typeof NonceBody>;
export type VerifyBodyT = z.infer<typeof VerifyBody>;
