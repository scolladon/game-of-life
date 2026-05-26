/**
 * Connexion Drizzle + better-sqlite3.
 *
 * - Singleton paresseux cote Node (la route API rappelle getDb a chaque hit,
 *   mais la connexion n est ouverte qu une fois).
 * - DB locale data/game-of-life.db (gitignored) ; le dossier est cree si absent.
 * - :memory: accepte pour les tests.
 *
 * Important : ce module ne doit PAS etre importe depuis un component client.
 * better-sqlite3 est un binding natif Node. Utiliser une route API.
 */

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { CREATE_TABLE_SQL } from './schema';

export type DrizzleDatabase = ReturnType<typeof drizzle>;

const DEFAULT_DB_PATH = 'data/game-of-life.db';

let cached: DrizzleDatabase | null = null;

function ensureDirectory(dbPath: string): void {
  if (dbPath === ':memory:') return;
  mkdirSync(dirname(dbPath), { recursive: true });
}

export function createDb(dbPath: string = DEFAULT_DB_PATH): DrizzleDatabase {
  ensureDirectory(dbPath);
  const sqlite = new Database(dbPath);
  sqlite.exec(CREATE_TABLE_SQL);
  return drizzle(sqlite);
}

export function getDb(): DrizzleDatabase {
  if (!cached) cached = createDb();
  return cached;
}
