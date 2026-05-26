/**
 * Repository sur les tables `patterns` + `anon_authors` (§4.2 — Cloud Patterns).
 *
 * - `createPattern` : insère (ou réutilise) l'auteur, puis le pattern.
 * - `listPatterns`  : liste les N derniers patterns (tri created_at DESC).
 * - `getPattern`    : lecture par id.
 *
 * Les grilles sont sérialisées en JSON pour rester portables. Les helpers
 * de cette couche gèrent la (dé)sérialisation, le caller manipule des `Grid`.
 */

import { desc, eq, sql } from 'drizzle-orm';
import type { Grid } from '@/core/grid';
import { createDb, type DrizzleDatabase, getDb } from './db';
import { anonAuthors, patterns } from './schema';

const DEFAULT_LIST_LIMIT = 50;

export interface PatternInput {
  readonly name: string;
  readonly grid: Grid;
  readonly ruleName: string;
  readonly authorToken: string;
  readonly authorDisplayName: string;
}

export interface PersistedPattern {
  readonly id: number;
  readonly name: string;
  readonly grid: Grid;
  readonly ruleName: string;
  readonly authorToken: string;
  readonly createdAt: Date;
}

function resolveDb(db?: DrizzleDatabase): DrizzleDatabase {
  return db ?? getDb();
}

async function upsertAuthor(
  target: DrizzleDatabase,
  token: string,
  displayName: string,
  now: Date,
): Promise<void> {
  // INSERT OR IGNORE — token existant ? on garde l'auteur initial, pas de mise à jour.
  await target
    .insert(anonAuthors)
    .values({ token, displayName, createdAt: now })
    .onConflictDoNothing({ target: anonAuthors.token });
}

export async function createPattern(
  input: PatternInput,
  db?: DrizzleDatabase,
): Promise<PersistedPattern> {
  if (input.name.trim().length === 0) {
    throw new Error('createPattern: name must not be empty');
  }
  if (input.authorToken.trim().length === 0) {
    throw new Error('createPattern: authorToken must not be empty');
  }
  const target = resolveDb(db);
  const now = new Date();
  await upsertAuthor(target, input.authorToken, input.authorDisplayName, now);
  const [row] = await target
    .insert(patterns)
    .values({
      name: input.name,
      gridJson: JSON.stringify(input.grid),
      ruleName: input.ruleName,
      authorToken: input.authorToken,
      createdAt: now,
    })
    .returning();
  if (!row) {
    throw new Error('createPattern: insertion returned no row');
  }
  return rowToPattern(row);
}

export async function listPatterns(
  limit: number = DEFAULT_LIST_LIMIT,
  db?: DrizzleDatabase,
): Promise<PersistedPattern[]> {
  const target = resolveDb(db);
  const rows = await target.select().from(patterns).orderBy(desc(patterns.id)).limit(limit);
  return rows.map(rowToPattern);
}

export async function getPattern(
  id: number,
  db?: DrizzleDatabase,
): Promise<PersistedPattern | null> {
  const target = resolveDb(db);
  const rows = await target.select().from(patterns).where(eq(patterns.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return rowToPattern(row);
}

export async function countPatterns(db?: DrizzleDatabase): Promise<number> {
  const target = resolveDb(db);
  const rows = await target.select({ count: sql<number>`count(*)` }).from(patterns);
  return Number(rows[0]?.count ?? 0);
}

function rowToPattern(row: typeof patterns.$inferSelect): PersistedPattern {
  return {
    id: row.id,
    name: row.name,
    grid: JSON.parse(row.gridJson) as Grid,
    ruleName: row.ruleName,
    authorToken: row.authorToken,
    createdAt: row.createdAt,
  };
}

// Re-export createDb pour faciliter les tests (DB :memory:).
export { createDb };
