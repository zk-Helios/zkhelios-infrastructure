import { z } from "zod";

export const AnnounceBody = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(2000),
  audience: z.union([z.enum(["all", "active"]), z.array(z.string().min(32).max(44)).max(1000)]).default("all"),
  email: z.boolean().default(false),
});

export const UsersQuery = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const PubkeyParam = z.object({ pubkey: z.string().min(32).max(44) });
