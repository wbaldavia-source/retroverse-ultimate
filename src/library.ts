import type { CoreId, GameRecord } from './types';

const DB_NAME = 'retroverse-library';
const STORE = 'games';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir a biblioteca local.'));
  });
}

export async function listGames(): Promise<GameRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as GameRecord[]).sort((a, b) => b.addedAt - a.addedAt));
    request.onerror = () => reject(request.error);
  });
}

export async function saveGame(file: File, core: CoreId): Promise<GameRecord> {
  const id = crypto.randomUUID();
  const game: GameRecord = {
    id,
    name: file.name.replace(/\.[^.]+$/, ''),
    fileName: file.name,
    size: file.size,
    addedAt: Date.now(),
    core,
    favorite: false,
    rom: file,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(game);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Não foi possível salvar o jogo.'));
  });
  return game;
}

export async function updateGame(game: GameRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(game);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removeGame(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function formatSize(size: number): string {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
