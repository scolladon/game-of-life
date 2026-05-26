/**
 * Repository sur la table `game_states`.
 *
 * - `saveState`        : INSERT d'un snapshot complet.
 * - `loadLatestState`  : SELECT le dernier snapshot (ORDER BY id DESC LIMIT 1).
 *
 * La grille est serialisee en JSON pour rester portable. Les helpers de cette
 * couche se chargent de la (de)serialisation, le caller manipule des `Grid`.
 */

import { desc } from 'drizzle-orm';
import type { Grid } from '@/core/grid';
import { createDb, type DrizzleDatabase, getDb } from './db';
import { gameStates } from './schema';

export interface GameStateSnapshot {
  readonly patternName: string;
  readonly generation: number;
  readonly ruleName: string;
  readonly grid: Grid;
}

export interface PersistedGameState extends GameStateSnapshot {
  readonly id: number;
  readonly createdAt: Date;
}

function resolveDb(db?: DrizzleDatabase): DrizzleDatabase {
  return db ?? getDb();
}

export async function saveState(
  snapshot: GameStateSnapshot,
  db?: DrizzleDatabase,
): Promise<PersistedGameState> {
  const target = resolveDb(db);
  const now = new Date();
  const [row] = await target
    .insert(gameStates)
    .values({
      patternName: snapshot.patternName,
      generation: snapshot.generation,
      ruleName: snapshot.ruleName,
      gridJson: JSON.stringify(snapshot.grid),
      createdAt: now,
    })
    .returning();
  if (!row) {
    throw new Error('saveState: insertion returned no row');
  }
  return rowToSnapshot(row);
}

export async function loadLatestState(db?: DrizzleDatabase): Promise<PersistedGameState | null> {
  const target = resolveDb(db);
  const rows = await target.select().from(gameStates).orderBy(desc(gameStates.id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return rowToSnapshot(row);
}

function rowToSnapshot(row: typeof gameStates.$inferSelect): PersistedGameState {
  return {
    id: row.id,
    patternName: row.patternName,
    generation: row.generation,
    ruleName: row.ruleName,
    grid: JSON.parse(row.gridJson) as Grid,
    createdAt: row.createdAt,
  };
}

// Re-export createDb pour faciliter les tests (DB :memory:).
export { createDb };
