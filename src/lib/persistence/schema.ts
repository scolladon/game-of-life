/**
 * Schéma Drizzle pour la persistance d'états du Game of Life.
 *
 * Une seule table : `game_states`. Chaque ligne = un snapshot complet
 * (pattern courant, génération, règle, grille sérialisée en JSON).
 *
 * `grid_json` stocke la grille en `Row[]` (boolean[][]) sérialisée — simple,
 * portable, suffisant à l'échelle pédagogique du Game of Life.
 */

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gameStates = sqliteTable('game_states', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patternName: text('pattern_name').notNull(),
  generation: integer('generation').notNull(),
  ruleName: text('rule_name').notNull(),
  gridJson: text('grid_json').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type GameStateRow = typeof gameStates.$inferSelect;
export type NewGameStateRow = typeof gameStates.$inferInsert;

/**
 * SQL CREATE TABLE idempotent — utilisé au boot du repository pour éviter
 * la friction d'une étape de migration manuelle dans ce sous-bloc pédagogique.
 */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS game_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL,
    generation INTEGER NOT NULL,
    rule_name TEXT NOT NULL,
    grid_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`;
