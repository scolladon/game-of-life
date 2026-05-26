# Design — Cloud Patterns

## Fichiers touchés

| Fichier | Rôle | Type |
|---|---|---|
| `src/lib/persistence/schema.ts` | Ajoute `patterns` + `anonAuthors`, étend `CREATE_TABLE_SQL` aux 3 tables. | **Modifié** |
| `src/lib/persistence/patterns-repository.ts` | CRUD sur `patterns` (read + create). | **Nouveau** |
| `src/lib/persistence/patterns-repository.test.ts` | Tests `:memory:` create / list / get. | **Nouveau** |
| `src/app/api/patterns/route.ts` | Handlers `GET` + `POST` Next App Router. | **Nouveau** |
| `src/components/PatternsCloud.tsx` | Server component liste les patterns. | **Nouveau** |

## Schema (extension)

```ts
// src/lib/persistence/schema.ts (ajouts)
export const anonAuthors = sqliteTable('anon_authors', {
  token: text('token').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const patterns = sqliteTable('patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  gridJson: text('grid_json').notNull(),
  ruleName: text('rule_name').notNull(),
  authorToken: text('author_token').notNull(),  // FK logique vers anon_authors.token (pas de FK SQL pour rester simple)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

`CREATE_TABLE_SQL` devient une chaîne qui crée les **3 tables** dans le même appel `sqlite.exec` (séparateur `;`).

## Repository API

```ts
// src/lib/persistence/patterns-repository.ts
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

export function createPattern(input: PatternInput, db?: DrizzleDatabase): Promise<PersistedPattern>;
export function listPatterns(limit?: number, db?: DrizzleDatabase): Promise<PersistedPattern[]>;
export function getPattern(id: number, db?: DrizzleDatabase): Promise<PersistedPattern | null>;
```

`createPattern` fait un `INSERT OR IGNORE` sur `anon_authors(token, display_name, created_at)` avant l'insert dans `patterns` — un nouveau token crée l'auteur, un token existant le réutilise.

## Route API

- `GET /api/patterns?limit=50` → `200 { patterns: PersistedPattern[] }`.
- `POST /api/patterns` body = `PatternInput` → `201 { id, createdAt }` ou `400 { error }`.
- `runtime = 'nodejs'` (cohérent avec `app/api/state/route.ts`).

## Tests

- `patterns-repository.test.ts` (mode `:memory:`) :
  - `given empty when listPatterns then []`.
  - `given a create when getPattern then round-trips grid + meta`.
  - `given two creates when listPatterns then renvoie le plus récent en premier`.
  - `given le même authorToken réutilisé when createPattern then conserve l'auteur initial`.

Pas de test route API pour §4.2 (le repository couvre l'essentiel, la route est triviale au-dessus).

## Notes architecturales

- **Extension sans rupture** — `game_states` (table de §3.3) n'est pas touchée. Le test `repository.test.ts` de §3.3 doit rester vert.
- **Pas de FK SQL** — `patterns.author_token` est une FK logique. Permet d'éviter les contraintes ON DELETE/UPDATE et de garder l'INSERT idempotent.
- **`createPattern` est l'unique point d'entrée écriture** — la route POST n'écrit jamais directement sur les tables.
- **L'UI `PatternsCloud` est un server component** (`async function`) qui fait un fetch local au repository — pas via HTTP, on n'a pas besoin d'un round-trip réseau côté serveur.
