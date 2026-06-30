import { prisma, type Prisma } from "@zkhelios/db";
import { ConflictError, NotFoundError, ValidationError } from "../../utils/errors";
import { isValidPubkey } from "../../lib/siws";
import type { UpdateMeBodyT, WatchBodyT } from "./schemas";

export class UserService {
  async getMe(pubkey: string) {
    const user = await prisma.user.findUnique({ where: { pubkey } });
    if (!user) throw new NotFoundError("User not found");
    return {
      pubkey: user.pubkey,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      preferredCurrency: user.preferredCurrency,
      notificationPrefs: user.notificationPrefs,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateMe(pubkey: string, patch: UpdateMeBodyT) {
    const data: Prisma.UserUpdateInput = {};
    if (patch.displayName !== undefined) data.displayName = patch.displayName;
    if (patch.preferredCurrency !== undefined) data.preferredCurrency = patch.preferredCurrency;
    if (patch.notificationPrefs !== undefined) data.notificationPrefs = patch.notificationPrefs as Prisma.InputJsonValue;
    if (patch.email !== undefined) {
      data.email = patch.email;
      data.emailVerified = false; // re-verify on change
    }
    try {
      const user = await prisma.user.update({ where: { pubkey }, data });
      return this.getMe(user.pubkey);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") throw new ConflictError("Email already in use");
      throw e;
    }
  }

  /** Public profile — limited fields + stats. */
  async getPublicProfile(pubkey: string) {
    if (!isValidPubkey(pubkey)) throw new ValidationError("Invalid public key");
    const user = await prisma.user.findUnique({ where: { pubkey } });
    const proofCount = await prisma.proofRecord.count({ where: { authority: pubkey } });
    return {
      pubkey,
      displayName: user?.displayName ?? null,
      joinedAt: (user?.createdAt ?? new Date(0)).toISOString(),
      proofCount,
    };
  }

  async listWatched(pubkey: string) {
    const rows = await prisma.watchedAddress.findMany({
      where: { user: { pubkey } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      pubkey: r.pubkey,
      label: r.label,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addWatched(pubkey: string, body: WatchBodyT) {
    if (!isValidPubkey(body.pubkey)) throw new ValidationError("Invalid public key");
    const user = await prisma.user.findUnique({ where: { pubkey }, select: { id: true } });
    if (!user) throw new NotFoundError("User not found");
    try {
      const row = await prisma.watchedAddress.create({
        data: { userId: user.id, pubkey: body.pubkey, label: body.label },
      });
      return { id: row.id, pubkey: row.pubkey, label: row.label, createdAt: row.createdAt.toISOString() };
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") throw new ConflictError("Address already watched");
      throw e;
    }
  }

  async removeWatched(pubkey: string, id: string) {
    await prisma.watchedAddress.deleteMany({ where: { id, user: { pubkey } } });
  }
}
