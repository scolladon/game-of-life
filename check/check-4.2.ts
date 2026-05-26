// Check §4.2 — Équipes d'agents : 3 features livrées en parallèle.
//
// Valide :
//   - 3 contrats `docs/features/{glow-up,speed-demon,cloud-patterns}/` avec
//     `prd.md` + `design.md` chacun non vides. C'est la trace pédagogique
//     de ce que produirait la phase PRD/Design avant le dispatch.
//
//   - Feature **Glow Up** (UI / theming) :
//       - `src/lib/theme/tokens.ts` exporte `themeTokens.light` et
//         `themeTokens.dark`.
//       - `src/components/ThemeToggle.tsx` est un client component qui
//         manipule la classe `dark` sur `<html>`.
//       - `<Board>` monte `<ThemeToggle />`.
//       - `Board.draw.ts` lit `themeTokens` (suppression des hex literals
//         hardcodés du module de dessin).
//       - `globals.css` déclare une classe `.game-board`.
//
//   - Feature **Speed Demon** (perf / Web Worker) :
//       - `src/workers/step.worker.ts` présent et importe `step` du core/.
//       - `src/lib/worker/step-client.ts` présent et expose
//         `computeNextGrid` + `isWorkerSupported` (fallback isomorphe).
//       - `use-simulator.ts` référence le wrapper worker (preuve
//         d'intégration de la couche perf).
//
//   - Feature **Cloud Patterns** (backend / API) :
//       - `src/lib/persistence/schema.ts` exporte les 3 tables
//         (`gameStates` préservé + `anonAuthors` + `patterns`).
//       - `CREATE_TABLE_SQL` crée les 3 tables.
//       - `src/lib/persistence/patterns-repository.ts` expose
//         `createPattern`, `listPatterns`, `getPattern`.
//       - `src/app/api/patterns/route.ts` expose `GET` + `POST` en
//         runtime nodejs.
//       - `src/components/PatternsCloud.tsx` présent (UI minimale).
//
// L'orchestration parallèle réelle (Agent + isolation worktree +
// run_in_background) n'est pas vérifiable statiquement — c'est une
// décision LLM. On valide la **trace livrée** : 3 contrats pré-écrits + 3
// features merged sans collision de fichiers.

import { existsSync, readFileSync, statSync } from 'node:fs';

const FEATURES = ['glow-up', 'speed-demon', 'cloud-patterns'] as const;
const MIN_DOC_BYTES = 200;

const THEME_TOKENS = 'src/lib/theme/tokens.ts';
const THEME_TOGGLE = 'src/components/ThemeToggle.tsx';
const BOARD = 'src/components/Board.tsx';
const BOARD_DRAW = 'src/components/Board.draw.ts';
const GLOBALS_CSS = 'src/app/globals.css';

const STEP_WORKER = 'src/workers/step.worker.ts';
const STEP_CLIENT = 'src/lib/worker/step-client.ts';
const USE_SIMULATOR = 'src/components/use-simulator.ts';

const SCHEMA = 'src/lib/persistence/schema.ts';
const PATTERNS_REPO = 'src/lib/persistence/patterns-repository.ts';
const PATTERNS_ROUTE = 'src/app/api/patterns/route.ts';
const PATTERNS_CLOUD_COMPONENT = 'src/components/PatternsCloud.tsx';

const REPOSITORY = 'src/lib/persistence/repository.ts';

const errors: string[] = [];

function checkExists(path: string, hint: string): boolean {
  if (!existsSync(path)) {
    errors.push(`Fichier absent : ${path}. ${hint}`);
    return false;
  }
  return true;
}

function checkDocNonEmpty(path: string, label: string): void {
  if (!checkExists(path, `Écris le contrat ${label} (PRD / DESIGN court, 1-2 pages).`)) return;
  const size = statSync(path).size;
  if (size < MIN_DOC_BYTES) {
    errors.push(
      `${path} : contenu trop court (${size} octets, < ${MIN_DOC_BYTES}). Le contrat doit décrire vision, scope, AC, fichiers touchés.`,
    );
  }
}

function readOrEmpty(path: string): string {
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf-8');
}

function checkContains(path: string, needle: string | RegExp, hint: string): void {
  const content = readOrEmpty(path);
  const matches = typeof needle === 'string' ? content.includes(needle) : needle.test(content);
  if (!matches) {
    errors.push(`${path} : ${hint}`);
  }
}

// === 1. Docs pédagogiques — 3 contrats pré-écrits ===

for (const feature of FEATURES) {
  checkDocNonEmpty(`docs/features/${feature}/prd.md`, `PRD de la feature ${feature}`);
  checkDocNonEmpty(`docs/features/${feature}/design.md`, `DESIGN de la feature ${feature}`);
}

// === 2. Feature Glow Up — UI / theming ===

if (checkExists(THEME_TOKENS, 'Crée la palette nommée Glow Up.')) {
  checkContains(
    THEME_TOKENS,
    /themeTokens\s*[:=]/,
    'doit exporter `themeTokens` (palette nommée light + dark).',
  );
  checkContains(THEME_TOKENS, /['"]light['"]/, 'doit déclarer le thème `light`.');
  checkContains(THEME_TOKENS, /['"]dark['"]/, 'doit déclarer le thème `dark`.');
  checkContains(THEME_TOKENS, /cellAlive/, 'doit exposer le jeton `cellAlive`.');
  checkContains(THEME_TOKENS, /cellDead/, 'doit exposer le jeton `cellDead`.');
}

if (checkExists(THEME_TOGGLE, 'Crée le composant client `<ThemeToggle />`.')) {
  checkContains(
    THEME_TOGGLE,
    /['"]use client['"]/,
    "doit être un client component (`'use client'` en première ligne).",
  );
  checkContains(
    THEME_TOGGLE,
    /classList\.toggle|classList\.add|classList\.remove/,
    'doit manipuler `document.documentElement.classList` pour porter la classe `dark`.',
  );
}

checkContains(
  BOARD,
  /<ThemeToggle\b/,
  "<Board> doit monter `<ThemeToggle />` dans son arbre (preuve d'intégration Glow Up).",
);

if (checkExists(BOARD_DRAW, 'Le module de dessin doit lire la palette nommée.')) {
  checkContains(
    BOARD_DRAW,
    /from\s+['"]@\/lib\/theme\/tokens['"]/,
    'doit importer `@/lib/theme/tokens` (suppression des hex literals hardcodés).',
  );
  checkContains(
    BOARD_DRAW,
    /themeTokens|getActivePalette/,
    'doit référencer `themeTokens` ou `getActivePalette` au lieu de hex literals.',
  );
}

if (checkExists(GLOBALS_CSS, 'Déclare la classe `.game-board` dans `globals.css`.')) {
  checkContains(
    GLOBALS_CSS,
    /\.game-board\s*\{/,
    'doit déclarer la classe `.game-board` (identité visuelle du canvas).',
  );
}

// === 3. Feature Speed Demon — Web Worker ===

if (checkExists(STEP_WORKER, 'Crée le Web Worker qui décharge `step()` du main thread.')) {
  checkContains(
    STEP_WORKER,
    /from\s+['"]@\/core\/step['"]/,
    'doit importer `step` du `core/` (zéro duplication de logique).',
  );
  checkContains(
    STEP_WORKER,
    /onmessage|addEventListener\(['"]message['"]/,
    'doit installer un handler `onmessage` (protocole worker).',
  );
  checkContains(STEP_WORKER, /postMessage/, 'doit `postMessage` la grille calculée en retour.');
}

if (checkExists(STEP_CLIENT, 'Crée le wrapper isomorphe `computeNextGrid` (worker + fallback).')) {
  checkContains(
    STEP_CLIENT,
    /export\s+function\s+computeNextGrid/,
    'doit exporter `computeNextGrid(grid, rule): Promise<Grid>`.',
  );
  checkContains(
    STEP_CLIENT,
    /export\s+function\s+isWorkerSupported/,
    "doit exporter `isWorkerSupported()` (test de l'environnement).",
  );
  checkContains(
    STEP_CLIENT,
    /typeof\s+Worker/,
    "doit gate-keeper `typeof Worker !== 'undefined'` (isomorphe SSR/Node).",
  );
}

checkContains(
  USE_SIMULATOR,
  /@\/lib\/worker\/step-client/,
  "doit importer `@/lib/worker/step-client` (preuve d'intégration de la couche Speed Demon).",
);

// === 4. Feature Cloud Patterns — schema + repo + route ===

if (checkExists(SCHEMA, 'Le schema Drizzle doit accueillir `patterns` + `anon_authors`.')) {
  const schema = readFileSync(SCHEMA, 'utf-8');
  if (!/export\s+const\s+gameStates\s*=/.test(schema)) {
    errors.push(
      `${SCHEMA} : régression §3.3 — la table \`gameStates\` doit rester exportée (Cloud Patterns *étend* le schema, ne le remplace pas).`,
    );
  }
  if (!/export\s+const\s+patterns\s*=/.test(schema)) {
    errors.push(`${SCHEMA} : doit exporter la table \`patterns\` (§4.2 — Cloud Patterns).`);
  }
  if (!/export\s+const\s+anonAuthors\s*=/.test(schema)) {
    errors.push(`${SCHEMA} : doit exporter la table \`anonAuthors\` (§4.2 — Cloud Patterns).`);
  }
  if (!/CREATE TABLE IF NOT EXISTS\s+patterns/i.test(schema)) {
    errors.push(`${SCHEMA} : \`CREATE_TABLE_SQL\` doit créer la table \`patterns\`.`);
  }
  if (!/CREATE TABLE IF NOT EXISTS\s+anon_authors/i.test(schema)) {
    errors.push(`${SCHEMA} : \`CREATE_TABLE_SQL\` doit créer la table \`anon_authors\`.`);
  }
  if (!/CREATE TABLE IF NOT EXISTS\s+game_states/i.test(schema)) {
    errors.push(
      `${SCHEMA} : régression §3.3 — \`CREATE_TABLE_SQL\` doit toujours créer la table \`game_states\`.`,
    );
  }
}

if (checkExists(PATTERNS_REPO, 'Crée le repository `patterns-repository.ts`.')) {
  checkContains(
    PATTERNS_REPO,
    /export\s+(async\s+)?function\s+createPattern/,
    'doit exporter `createPattern`.',
  );
  checkContains(
    PATTERNS_REPO,
    /export\s+(async\s+)?function\s+listPatterns/,
    'doit exporter `listPatterns`.',
  );
  checkContains(
    PATTERNS_REPO,
    /export\s+(async\s+)?function\s+getPattern/,
    'doit exporter `getPattern`.',
  );
}

if (checkExists(PATTERNS_ROUTE, 'Crée la route API `app/api/patterns/route.ts`.')) {
  checkContains(
    PATTERNS_ROUTE,
    /export\s+(async\s+)?function\s+GET/,
    'doit exporter le handler `GET`.',
  );
  checkContains(
    PATTERNS_ROUTE,
    /export\s+(async\s+)?function\s+POST/,
    'doit exporter le handler `POST`.',
  );
  checkContains(
    PATTERNS_ROUTE,
    /export\s+const\s+runtime\s*=\s*['"]nodejs['"]/,
    "doit forcer `runtime = 'nodejs'` (better-sqlite3 est un binding natif).",
  );
}

checkExists(
  PATTERNS_CLOUD_COMPONENT,
  'Crée le composant `<PatternsCloud />` (UI minimale qui liste les patterns).',
);

// === 5. Régression §3.3 — repository existant intact ===

checkExists(
  REPOSITORY,
  'Régression §3.3 : `src/lib/persistence/repository.ts` (game_states) doit rester en place.',
);

if (errors.length === 0) {
  console.log('✅ check-4.2');
  console.log('   ↳ 3 contrats `docs/features/{glow-up,speed-demon,cloud-patterns}/` pré-écrits.');
  console.log(
    '   ↳ Glow Up : palette nommée `themeTokens` + `<ThemeToggle />` monté dans `<Board>` + `.game-board` dans CSS.',
  );
  console.log(
    '   ↳ Speed Demon : `step.worker.ts` + wrapper isomorphe `computeNextGrid` (fallback Node), référencé par `use-simulator`.',
  );
  console.log(
    '   ↳ Cloud Patterns : schema étendu (3 tables) + `patterns-repository` + route API `/api/patterns` (GET + POST, runtime nodejs).',
  );
  console.log('   ↳ Régression §3.3 OK : `gameStates` + `repository.ts` (game_states) intacts.');
  console.log('');
  console.log(
    "💡 Concept §4.2 — équipes d'agents : 3 sous-agents dispatchés en parallèle dans des",
  );
  console.log(
    '   worktrees Git isolés, chacun livre une feature indépendante (aucun chevauchement de',
  );
  console.log('   fichiers → merge sans conflit). La session principale orchestre, agrège, merge.');
  process.exit(0);
}

console.log('❌ check-4.2');
for (const err of errors) {
  console.log(`   ↳ ${err}`);
}
console.log('   ↳ Hint : voir slides §4.2 mise en place (ou prompts/4.2.md en bouée).');
process.exit(1);
