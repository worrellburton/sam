// Minimal Promise-based IndexedDB wrapper. Used by hooks that want
// their in-memory caches (TTS audio blobs, OAuth tokens) to survive
// page reloads without pulling in a whole library.
//
// Store layout:
//   database "sam-cache"
//   object stores created on demand via openStore(name).
//
// Values are stored verbatim — Blobs, strings, JSON-serializable
// objects all work directly.

import { logError } from "./log";

const DB_NAME = "sam-cache";
const DB_VERSION = 1;

// Known stores upfront so we can create them in the one-shot upgrade.
// New stores can be added here as we grow; bumping DB_VERSION triggers
// the upgrade path for existing clients.
const KNOWN_STORES = ["tts-audio", "athena-token"] as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const store of KNOWN_STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

type StoreName = (typeof KNOWN_STORES)[number];

export async function idbGet<T>(store: StoreName, key: string): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    logError("idb.get", err, { store, key });
    return undefined;
  }
}

export async function idbSet(store: StoreName, key: string, value: unknown): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    logError("idb.set", err, { store, key });
  }
}

export async function idbDelete(store: StoreName, key: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    logError("idb.delete", err, { store, key });
  }
}
