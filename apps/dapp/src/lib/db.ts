import Dexie, { type Table } from "dexie";
import type { StoredProof } from "@/lib/zk/types";

/** IndexedDB store for the user's proof history (client-only). */
class ZkHeliosDB extends Dexie {
  proofs!: Table<StoredProof, string>;

  constructor() {
    super("zkhelios");
    this.version(1).stores({
      // indexed fields: id (pk), kind, status, createdAt
      proofs: "id, kind, status, createdAt",
    });
  }
}

let _db: ZkHeliosDB | null = null;

/** Lazily create the DB (guards against SSR where indexedDB is undefined). */
export function db(): ZkHeliosDB {
  if (!_db) _db = new ZkHeliosDB();
  return _db;
}

export async function saveProof(p: StoredProof) {
  await db().proofs.put(p);
}

export async function updateProof(id: string, patch: Partial<StoredProof>) {
  await db().proofs.update(id, patch);
}

export async function listProofs(): Promise<StoredProof[]> {
  return db().proofs.orderBy("createdAt").reverse().toArray();
}

export async function deleteProof(id: string) {
  await db().proofs.delete(id);
}
