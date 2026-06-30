import { z } from "zod";

export const ListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const PreferencesBody = z
  .object({
    channels: z.object({ inApp: z.boolean(), email: z.boolean(), push: z.boolean() }).partial(),
    events: z
      .object({
        proofVerified: z.boolean(),
        proofRevoked: z.boolean(),
        watchedAddressActivity: z.boolean(),
        circuitRegistered: z.boolean(),
        systemAnnouncements: z.boolean(),
      })
      .partial(),
  })
  .partial();

export const EmailStartBody = z.object({ email: z.string().email().max(120) });
export const EmailConfirmBody = z.object({ code: z.string().length(6) });

export const PushSubscribeBody = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export const IdParam = z.object({ id: z.string() });
