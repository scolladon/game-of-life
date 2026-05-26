/**
 * Schéma Drizzle pour la persistance du Game of Life.
 *
 * Trois tables :
 *   - `game_states`  : snapshots de simulation (§3.3).
 *   - `patterns`     : patterns custom partagés (§4.2 — Cloud Patterns).
 *   - `anon_authors` : auteurs anonymes des patterns (§4.2 — Cloud Patterns).
 *
 * `grid_json` stocke les grilles en `Row[]` (boolean[][]) sérialisé — simple,
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
 * Auteurs anonymes des patterns Cloud (§4.2).
 *
 * Pas d'auth réelle — `token` est un opaque arbitraire généré côté client.
 */
export const anonAuthors = sqliteTable('anon_authors', {
  token: text('token').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type AnonAuthorRow = typeof anonAuthors.$inferSelect;
export type NewAnonAuthorRow = typeof anonAuthors.$inferInsert;

/**
 * Patterns custom partagés (§4.2 — Cloud Patterns).
 *
 * `author_token` est une FK logique vers `anon_authors.token` — pas de FK
 * SQL pour rester compatible avec la stratégie idempotente
 * `CREATE TABLE IF NOT EXISTS`.
 */
export const patterns = sqliteTable('patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  gridJson: text('grid_json').notNull(),
  ruleName: text('rule_name').notNull(),
  authorToken: text('author_token').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type PatternRow = typeof patterns.$inferSelect;
export type NewPatternRow = typeof patterns.$inferInsert;

/**
 * SQL CREATE TABLE idempotent — utilisé au boot du repository pour éviter
 * la friction d'une étape de migration manuelle dans ce sous-bloc pédagogique.
 *
 * Inclut les 3 tables, exécutées dans un seul appel `sqlite.exec`.
 */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS game_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL,
    generation INTEGER NOT NULL,
    rule_name TEXT NOT NULL,
    grid_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS anon_authors (
    token TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grid_json TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    author_token TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;
