import { z } from "zod";

export const UpdateMeBody = z.object({
  displayName: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only")
    .optional(),
  email: z.string().email().max(120).optional(),
  preferredCurrency: z.enum(["USD", "EUR", "GBP", "JPY", "IDR"]).optional(),
  notificationPrefs: z
    .object({
      channels: z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() }).partial(),
      events: z.record(z.boolean()),
    })
    .partial()
    .optional(),
});

export const PubkeyParam = z.object({ pubkey: z.string().min(32).max(44) });

export const WatchBody = z.object({
  pubkey: z.string().min(32).max(44),
  label: z.string().max(40).optional(),
});

export const IdParam = z.object({ id: z.string() });

export type UpdateMeBodyT = z.infer<typeof UpdateMeBody>;
export type WatchBodyT = z.infer<typeof WatchBody>;
