# PRD — Cloud Patterns (backend / API)

## Vision

Permettre à un utilisateur de **partager ses propres patterns** (grilles custom) via une API REST simple, persistés en SQLite à côté des `game_states` de §3.3. Démontrer la capacité d'une équipe d'agents à livrer une feature *backend + API design* sans toucher au front existant.

## Scope

- **Extension du schema Drizzle** existant : ajout des tables `patterns` + `anon_authors` à côté de `game_states` (qui n'est *pas* supprimée).
- **Repository** `src/lib/persistence/patterns-repository.ts` : `createPattern`, `listPatterns`, `getPattern`.
- **Route API** `src/app/api/patterns/route.ts` :
  - `GET /api/patterns` → liste les N derniers patterns (limit 50, tri `created_at DESC`).
  - `POST /api/patterns` → crée un pattern à partir du body validé.
- **Auteur anonyme** : table `anon_authors` indexée par `token` (string opaque). Pas d'auth réelle — le token est généré côté client et persisté en cookie/localStorage (hors scope §4.2 : on accepte un token littéral dans le body).
- **UI minimaliste** `src/components/PatternsCloud.tsx` : affiche la liste GET (server-fetched, server component).

## Acceptance criteria

- AC1 — `src/lib/persistence/schema.ts` exporte `patterns` (table Drizzle) et `anonAuthors` (table Drizzle), en plus de `gameStates` (qui reste exporté inchangé).
- AC2 — La constante `CREATE_TABLE_SQL` de `schema.ts` crée les **3 tables** de manière idempotente (`CREATE TABLE IF NOT EXISTS`).
- AC3 — `src/lib/persistence/patterns-repository.ts` exporte `createPattern(input, db?)`, `listPatterns(limit?, db?)`, `getPattern(id, db?)`.
- AC4 — `src/app/api/patterns/route.ts` exporte `GET` et `POST` (handlers Next App Router) ; `runtime = 'nodejs'` ; POST valide le body et renvoie 400 si invalide, 201 si OK ; GET renvoie 200 + liste JSON.
- AC5 — `src/components/PatternsCloud.tsx` existe et rend une liste (peut être vide).
- AC6 — Tests `patterns-repository.test.ts` verts : create + list + get sur `:memory:`.
- AC7 — Régression §3.3 OK : `repository.test.ts` (game_states) reste vert.

## Non-goals

- Pas d'authentification réelle (le token est un opaque arbitraire).
- Pas de rate limiting (mentionné DESIGN §6.2, lot futur).
- Pas de migration outillée (`drizzle-kit migrate`) — on s'aligne sur la stratégie `CREATE TABLE IF NOT EXISTS` de §3.3.
- Pas de partage par URL courte (DESIGN §6.2, hors §4.2).
- Pas de soumission POST depuis l'UI — la création se teste via `curl` ou `fetch` en console. La création visuelle est un lot futur.
